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

export const OPENMAPS_WFS_URL = 'https://openmaps.gov.bc.ca/geo/pub/ows';

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
export const buildElevationWfsUrl = (
  typeName: string,
  bcAlbersWkt: string
): string => {
  const params = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeNames: typeName,
    outputFormat: 'application/json',
    propertyName: 'ELEVATION',
    count: String(MAX_FEATURES),
    CQL_FILTER: `INTERSECTS(GEOMETRY,${bcAlbersWkt})`
  });
  return `${OPENMAPS_WFS_URL}?${params.toString()}`;
};

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
  let res: Response;
  try {
    res = await fetch(buildElevationWfsUrl(typeName, bcAlbersWkt), {
      signal: controller.signal
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(
        `Elevation WFS timed out after ${WFS_TIMEOUT_MS / 1000} seconds`
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) return [];
  return extractElevations((await res.json()) as WfsElevationCollection);
};

/**
 * Compute the elevation min/max across an AOI polygon. Queries TRIM
 * contour lines first (dense, ~20 m intervals); if no contours
 * intersect (small or flat polygons) falls back to BC spot elevation
 * points. Returns `null` when neither source has any features in the
 * AOI — UI layers should treat that as "no data" not "error".
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

  const contourElevs = await fetchElevationsFromLayer(CONTOUR_LINES_LAYER, wkt);
  if (contourElevs.length > 0) {
    return {
      minM: Math.min(...contourElevs),
      maxM: Math.max(...contourElevs),
      source: 'contours',
      sampleCount: contourElevs.length
    };
  }

  const spotElevs = await fetchElevationsFromLayer(SPOT_ELEVATION_LAYER, wkt);
  if (spotElevs.length > 0) {
    return {
      minM: Math.min(...spotElevs),
      maxM: Math.max(...spotElevs),
      source: 'spot-points',
      sampleCount: spotElevs.length
    };
  }

  return null;
};
