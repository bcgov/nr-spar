/**
 * Client-side WFS fetcher for seedlot/veglot point features from
 * DataBC. Replaces the legacy SPAR approach of stacking 24+ per-species
 * WMS layers — we hit the same `*_POINT_MVW` view ONCE per viewport
 * change and render features client-side as Leaflet circle markers so
 * the per-species visual differentiation is preserved without the
 * socket-pool cost.
 *
 * Used by `<SeedlotPointsLayer>` to populate the "Active Seedlots",
 * "Expired Seedlots", "Active Veglots", and "Expired Veglots" overlays.
 */

import type { Feature, FeatureCollection, Point } from 'geojson';

export const OPENMAPS_WFS_URL = 'https://openmaps.gov.bc.ca/geo/pub/ows';

/** Layer typeName for active+expired seedlot point features. */
export const SEEDLOT_POINT_LAYER = 'pub:WHSE_FOREST_VEGETATION.SEED_SEEDLOT_POINT_MVW';

/** Layer typeName for active+expired veglot point features. */
export const VEGLOT_POINT_LAYER = 'pub:WHSE_FOREST_VEGETATION.SEED_VEG_LOT_POINT_MVW';

/**
 * WFS fetch timeout — long enough for slow DataBC responses, short
 *  enough that a wedged request doesn't lock up the UI.
 */
const WFS_TIMEOUT_MS = 20000;

/**
 * Cap on features per fetch. The MVW views can be large (~12k+ for
 *  active seedlots province-wide) and we never want to render more
 *  than this many markers at once. A bbox-constrained fetch at typical
 *  drawing zoom returns well under this.
 */
const MAX_FEATURES = 500;

/**
 * Bounding box in WGS84 (EPSG:4326) — `[south, west, north, east]` to
 * match Leaflet's `bounds.getSouth() / getWest() / getNorth() / getEast()`
 * ordering for ease at call sites.
 */
export interface LngLatBoundsTuple {
  south: number;
  west: number;
  north: number;
  east: number;
}

/**
 * One seedlot/veglot point flattened from the WFS GeoJSON envelope into
 * the shape the renderer actually consumes.
 */
export interface SeedlotPoint {
  lotNumber: string;
  vegetationCode: string;
  bcgZone: string | null;
  activeIndicator: 'YES' | 'NO' | null;
  lat: number;
  lng: number;
}

interface WfsProperties {
  SEEDLOT_NUMBER?: string | number;
  VEG_LOT_ID?: string | number;
  VEGETATION_CODE?: string;
  BEC_ZONE?: string;
  ACTIVE_IND?: string;
  [key: string]: unknown;
}

const numberPropertyToString = (
  props: WfsProperties,
  keys: Array<keyof WfsProperties>
): string => {
  const match = keys
    .map((key) => props[key])
    .find((v) => v !== undefined && v !== null && String(v).length > 0);
  return match !== undefined ? String(match) : '';
};

const featureToPoint = (feature: Feature<Point, WfsProperties>): SeedlotPoint | null => {
  const coords = feature.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;
  const [lng, lat] = coords;
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  const props = feature.properties ?? {};
  return {
    lotNumber: numberPropertyToString(props, ['SEEDLOT_NUMBER', 'VEG_LOT_ID']),
    vegetationCode: String(props.VEGETATION_CODE ?? ''),
    bcgZone: typeof props.BEC_ZONE === 'string' ? props.BEC_ZONE : null,
    activeIndicator:
      props.ACTIVE_IND === 'YES' || props.ACTIVE_IND === 'NO'
        ? props.ACTIVE_IND
        : null,
    lat,
    lng
  };
};

/**
 * Build the DataBC WFS GetFeature URL for a bbox-constrained query of
 * the supplied point-layer typeName. Exposed for unit testing the URL
 * composition without firing a network call.
 *
 * The `activeOnly` flag combines into the same `CQL_FILTER` predicate
 * as the bbox — `BBOX(GEOMETRY, …) AND ACTIVE_IND='YES'`. DataBC WFS
 * 2.0 rejects requests that pass `bbox` and `cql_filter` as separate
 * params ("mutually exclusive"), so we encode everything via CQL.
 */
const escapeCql = (value: string): string => value.replace(/'/g, "''");

export const buildSeedlotPointsWfsUrl = (
  typeName: string,
  bounds: LngLatBoundsTuple,
  activeOnly: 'YES' | 'NO' | null = null,
  speciesCode: string | null = null
): string => {
  // GeoServer CQL BBOX takes `minX, minY, maxX, maxY` regardless of the
  // EPSG axis-order convention — so the order is always
  // `west, south, east, north` for EPSG:4326. Passing south/west by
  // mistake produces a degenerate bbox that returns zero features.
  const cqlClauses: string[] = [
    `BBOX(GEOMETRY,${bounds.west},${bounds.south},${bounds.east},${bounds.north},'EPSG:4326')`
  ];
  if (activeOnly !== null) {
    cqlClauses.push(`ACTIVE_IND='${activeOnly}'`);
  }
  if (speciesCode && speciesCode.trim().length > 0) {
    cqlClauses.push(`VEGETATION_CODE='${escapeCql(speciesCode.trim().toUpperCase())}'`);
  }
  const params = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeNames: typeName,
    outputFormat: 'application/json',
    srsName: 'EPSG:4326',
    count: String(MAX_FEATURES),
    CQL_FILTER: cqlClauses.join(' AND ')
  });
  return `${OPENMAPS_WFS_URL}?${params.toString()}`;
};

/**
 * Fetch seedlot/veglot point features for the supplied bbox. Returns
 * an empty array on any non-2xx response (fail-open) so a transient
 * DataBC outage doesn't blank the user's map indefinitely. Throws on
 * timeout — callers may want to surface that visually.
 */
export const fetchSeedlotPoints = async (
  typeName: string,
  bounds: LngLatBoundsTuple,
  activeOnly: 'YES' | 'NO' | null = null,
  speciesCode: string | null = null
): Promise<SeedlotPoint[]> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WFS_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(
      buildSeedlotPointsWfsUrl(typeName, bounds, activeOnly, speciesCode),
      { signal: controller.signal }
    );
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(
        `WFS seedlot-points fetch timed out after ${WFS_TIMEOUT_MS / 1000} seconds`
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) return [];

  const fc = (await res.json()) as FeatureCollection<Point, WfsProperties>;
  const points: SeedlotPoint[] = [];
  (fc.features ?? []).forEach((feature) => {
    const p = featureToPoint(feature);
    if (p) points.push(p);
  });
  return points;
};
