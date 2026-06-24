import type {
  Feature, FeatureCollection, MultiPolygon, Polygon
} from 'geojson';

import type { AoiPolygon } from '../types/SparMapTypes';

/**
 * Public DataBC WFS endpoint that serves the seedlot collection-area
 * polygons. Same source the legacy CWM `themeColArea` used to pre-load
 * existing AOI geometry on open. Anonymous access; no auth header.
 */
export const OPENMAPS_WFS_URL = 'https://openmaps.gov.bc.ca/geo/pub/ows';

/**
 * BCGW layer (typeName) that holds the saved collection-area polygons,
 * keyed by `SEEDLOT_NUMBER`.
 */
export const SEEDLOT_COLLECTION_LAYER = 'pub:WHSE_FOREST_VEGETATION.SEED_SEEDLOT_COLLECTION_SVW';

const WFS_TIMEOUT_MS = 15000;

/**
 * Build the URL the legacy `fetchFeaturesByAttribute` call would have
 * built — WFS 2.0 GetFeature, CQL_FILTER on SEEDLOT_NUMBER, GeoJSON out.
 * Exposed for unit testing the URL composition without firing the
 * actual network call.
 */
export const buildCollectionAreaWfsUrl = (seedlotNumber: string): string => {
  const params = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeNames: SEEDLOT_COLLECTION_LAYER,
    outputFormat: 'application/json',
    srsName: 'EPSG:4326',
    CQL_FILTER: `SEEDLOT_NUMBER='${seedlotNumber.replace(/'/g, "''")}'`
  });
  return `${OPENMAPS_WFS_URL}?${params.toString()}`;
};

const isPolygon = (g: unknown): g is Polygon => !!g && typeof g === 'object' && (g as { type?: string }).type === 'Polygon';

const isMultiPolygon = (g: unknown): g is MultiPolygon => !!g && typeof g === 'object' && (g as { type?: string }).type === 'MultiPolygon';

/**
 * Normalize a WFS feature into a list of `AoiPolygon` features. The
 * BCGW layer may emit either Polygon or MultiPolygon geometries; the
 * latter is split into N individual Polygon features so each becomes
 * an independently-editable Geoman layer on the map. Mirrors the import
 * path in `importShape.ts`.
 */
const normalizeFeature = (feature: Feature): AoiPolygon[] => {
  const geom = feature.geometry;
  if (!geom) return [];
  if (isPolygon(geom)) {
    return [{ type: 'Feature', geometry: geom, properties: feature.properties ?? {} }];
  }
  if (isMultiPolygon(geom)) {
    return geom.coordinates.map((coords) => ({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: coords },
      properties: feature.properties ?? {}
    }));
  }
  return [];
};

/**
 * Fetch the saved collection-area polygon(s) for a given seedlot from
 * the DataBC WFS. Returns an empty array when:
 *   - the seedlot has no saved polygon
 *   - the seedlot doesn't exist in the BCGW layer
 *   - the WFS call returns a non-2xx (so the pre-load fails open)
 *
 * Throws only for timeout / network errors that the caller may want to
 * surface as a notification. The fail-open empty-array path keeps the
 * page usable when DataBC is rate-limited or down.
 */
export const fetchCollectionAreaBySeedlotNumber = async (
  seedlotNumber: string
): Promise<AoiPolygon[]> => {
  if (!seedlotNumber || seedlotNumber.trim().length === 0) return [];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WFS_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(buildCollectionAreaWfsUrl(seedlotNumber), {
      signal: controller.signal
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(
        `WFS pre-load timed out after ${WFS_TIMEOUT_MS / 1000} seconds`
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) return [];

  const fc = (await res.json()) as FeatureCollection;
  const polygons: AoiPolygon[] = [];
  (fc.features ?? []).forEach((feature) => {
    polygons.push(...normalizeFeature(feature));
  });
  return polygons;
};
