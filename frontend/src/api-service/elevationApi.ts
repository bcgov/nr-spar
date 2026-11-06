/**
 * Elevation range fetcher for an arbitrary AOI polygon.
 *
 * Queries DataBC TRIM contour lines (every ~20 m elevation interval,
 * province-wide) for features intersecting the polygon and returns the
 * min/max of the contour `ELEVATION` attribute. Falls back to BC spot
 * elevation points when no contour features intersect (typical for
 * very small or low-relief polygons).
 *
 * Used by `<GeomCalcPanel>` to surface "Elevation: min–max m" per AOI.
 * The legacy SPAR map didn't show this; product wanted it added for the
 * Collection Area flow so operators can sanity-check that a polygon
 * stays within an elevation band suitable for the seedlot's species.
 */

import type {
  Feature, MultiPolygon, Polygon, Position
} from 'geojson';

import { wgs84ToBcAlbers } from '../legacy_translated/SPR_SPATIAL_UTILS';
import { buildOpenmapsProxyUrl, getOpenmapsJson, isOpenmapsAbort } from './openmapsProxy';

/** TRIM contour line layer — dense elevation data with ELEVATION (m). */
export const CONTOUR_LINES_LAYER = 'pub:WHSE_BASEMAPPING.TRIM_CONTOUR_LINES';

/** Spot elevation points — sparse fallback when contours don't intersect. */
export const SPOT_ELEVATION_LAYER = 'pub:WHSE_BASEMAPPING.BC_SPOT_ELEVATION_POINTS_500M';

/** Max features per WFS GetFeature — caps server load + payload size. */
const MAX_FEATURES = 5000;

/** Fetch timeout. Elevation queries can be slow for large polygons. */
const WFS_TIMEOUT_MS = 30000;

export interface ElevationRange {
  /** Minimum elevation in metres across the polygon. */
  minM: number;
  /** Maximum elevation in metres across the polygon. */
  maxM: number;
  /** Whether the values came from dense contour lines or sparse spot points. */
  source: 'contours' | 'spot-points';
  /** Number of underlying features sampled to compute the range. */
  sampleCount: number;
}

const ringToBcAlbersWkt = (ring: Position[]): string => {
  const pairs = ring.map(([lng, lat]) => {
    const [e, n] = wgs84ToBcAlbers([lng, lat]);
    return `${e} ${n}`;
  });
  return `(${pairs.join(', ')})`;
};

const polygonToBcAlbersWkt = (geom: Polygon): string => `POLYGON(${geom.coordinates.map(ringToBcAlbersWkt).join(', ')})`;

const multiPolygonToBcAlbersWkt = (geom: MultiPolygon): string => {
  const wkts = geom.coordinates.map(
    (rings) => `(${rings.map(ringToBcAlbersWkt).join(', ')})`
  );
  return `MULTIPOLYGON(${wkts.join(', ')})`;
};

/**
 * Convert a GeoJSON Polygon or MultiPolygon Feature (in WGS84) into a
 * BC Albers (EPSG:3005) WKT string suitable for use inside a CQL
 * `INTERSECTS(GEOMETRY, …)` predicate. DataBC GeoServer interprets
 * CQL filter geometries in the layer's native CRS (EPSG:3005)
 * regardless of `SrsName`, so we MUST reproject — verified empirically
 * (same quirk that `becZonesApi.ts` works around).
 */
export const polygonFeatureToBcAlbersWkt = (
  feature: Feature<Polygon | MultiPolygon>
): string => {
  const geom = feature.geometry;
  if (geom.type === 'MultiPolygon') {
    return multiPolygonToBcAlbersWkt(geom);
  }
  return polygonToBcAlbersWkt(geom);
};

/**
 * Build the WFS GetFeature URL for an elevation-range query against
 * the supplied typeName. Filter is an `INTERSECTS(GEOMETRY, WKT)`
 * predicate; only the `ELEVATION` property is requested so the
 * response stays small. Exposed for unit testing the URL composition
 * without firing a network call.
 */
export const buildElevationWfsParams = (
  typeName: string,
  bcAlbersWkt: string
): URLSearchParams => new URLSearchParams({
  service: 'WFS',
  version: '2.0.0',
  request: 'GetFeature',
  typeNames: typeName,
  outputFormat: 'application/json',
  propertyName: 'ELEVATION',
  count: String(MAX_FEATURES),
  CQL_FILTER: `INTERSECTS(GEOMETRY,${bcAlbersWkt})`
});

export const buildElevationWfsUrl = (
  typeName: string,
  bcAlbersWkt: string
): string => buildOpenmapsProxyUrl(buildElevationWfsParams(typeName, bcAlbersWkt));

interface WfsElevationFeature {
  properties?: { ELEVATION?: unknown };
}

interface WfsElevationCollection {
  features?: WfsElevationFeature[];
}

const extractElevations = (json: WfsElevationCollection): number[] => {
  const out: number[] = [];
  (json.features ?? []).forEach((f) => {
    const v = f.properties?.ELEVATION;
    if (typeof v === 'number' && Number.isFinite(v)) {
      out.push(v);
    }
  });
  return out;
};

const fetchElevationsFromLayer = async (
  typeName: string,
  bcAlbersWkt: string
): Promise<number[]> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WFS_TIMEOUT_MS);
  try {
    const json = await getOpenmapsJson<WfsElevationCollection>(
      buildElevationWfsParams(typeName, bcAlbersWkt),
      controller.signal
    );
    return extractElevations(json);
  } catch (err) {
    if (isOpenmapsAbort(err)) {
      throw new Error(
        `Elevation WFS timed out after ${WFS_TIMEOUT_MS / 1000} seconds`
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
};

/** Keep a caught rejection as an `Error` so it can be rethrown later. */
const asError = (err: unknown): Error => (
  err instanceof Error ? err : new Error(String(err))
);

const rangeFrom = (
  elevations: number[],
  source: ElevationRange['source']
): ElevationRange => ({
  minM: Math.min(...elevations),
  maxM: Math.max(...elevations),
  source,
  sampleCount: elevations.length
});

/**
 * Compute the elevation min/max across an AOI polygon. Queries TRIM
 * contour lines first (dense, ~20 m intervals); if no contours
 * intersect (small or flat polygons) falls back to BC spot elevation
 * points.
 *
 * Returns `null` only when a layer answered successfully and had no
 * features in the AOI — that is genuine "no data". A failed query is
 * rethrown so callers can tell "nothing here" apart from "we could not
 * ask", instead of both surfacing as an empty elevation band. The spot
 * fallback is still attempted when the contour query fails, so a
 * transient outage on one layer does not lose the other.
 *
 * Note: the contour layer is high-resolution and a province-wide query
 * over a large polygon could return thousands of features; the
 * `MAX_FEATURES` cap (5000) and BC Gov server-side limits prevent
 * pathological cases.
 */
export const fetchPolygonElevationRange = async (
  feature: Feature<Polygon | MultiPolygon>
): Promise<ElevationRange | null> => {
  const wkt = polygonFeatureToBcAlbersWkt(feature);

  let contourError: Error | null = null;
  try {
    const contourElevs = await fetchElevationsFromLayer(CONTOUR_LINES_LAYER, wkt);
    if (contourElevs.length > 0) {
      return rangeFrom(contourElevs, 'contours');
    }
  } catch (err) {
    contourError = asError(err);
  }

  let spotElevs: number[];
  try {
    spotElevs = await fetchElevationsFromLayer(SPOT_ELEVATION_LAYER, wkt);
  } catch (err) {
    // Both layers failed — surface the first failure, not a blank range.
    throw contourError ?? asError(err);
  }
  if (spotElevs.length > 0) {
    return rangeFrom(spotElevs, 'spot-points');
  }

  // Spot points were empty, but we never got an answer from contours, so
  // we cannot honestly claim the AOI has no elevation data.
  if (contourError !== null) {
    throw contourError;
  }
  return null;
};
