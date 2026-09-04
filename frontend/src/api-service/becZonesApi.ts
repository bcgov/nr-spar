import type {
  Feature, FeatureCollection, MultiPolygon, Polygon, Position
} from 'geojson';

import { wgs84ToBcAlbers } from '../legacy_translated/SPR_SPATIAL_UTILS';
import { cqlQuoted, isCqlSafeIdentifier } from '../utils/CqlUtils';
import { buildOpenmapsProxyUrl, getOpenmapsJson, isOpenmapsAbort } from './openmapsProxy';

/**
 * Attributes carried on each feature returned by the BEC layer WFS.
 * Only the fields the AOUCBST side panel and identify popup actually
 * read are listed; other attributes pass through untouched.
 */
export interface BecZoneProperties {
  MAP_LABEL?: string;
  ZONE?: string;
  SUBZONE?: string;
  VARIANT?: string | null;
  PHASE?: string | null;
  ZONE_NAME?: string;
  SUBZONE_NAME?: string;
  VARIANT_NAME?: string;
  NATURAL_DISTURBANCE?: string;
  NATURAL_DISTURBANCE_NAME?: string;
  FEATURE_AREA_SQM?: number;
}

/**
 * DataBC layer name for the full-resolution BEC polygon feature type.
 * Matches the layer the Identify tool queries at `shared-constants/spar-map.ts`
 * and `BecIdentifyLayer`. JSON fetches go through the SPAR OpenMaps proxy.
 */
export const BEC_QUERY_LAYER = 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY';

const BEC_WFS_TIMEOUT_MS = 15000;

/**
 * Tomcat's default max-http-request-header-size is 8 KiB. A CQL_FILTER
 * carrying a large WKT MultiPolygon will be rejected by the container
 * *before* our allowlist runs, and the user sees a generic "unable to
 * validate" message. Stay well under that so the failure is ours and
 * the message is honest.
 */
const MAX_CQL_CHARS = 6000;

/**
 * Shape of one feature as returned by the WFS GeoJSON response. Only the
 * `ZONE` property is required — any additional attributes are tolerated
 * but ignored because the caller only needs zone codes.
 */
interface BecZoneFeature {
  properties?: {
    ZONE?: unknown;
    [key: string]: unknown;
  };
}

interface WfsFeatureCollection {
  features?: BecZoneFeature[];
}

type BecCqlPredicate = 'INTERSECTS' | 'CONTAINS';

const distinctZonesFromFeatureCollection = (json: WfsFeatureCollection): string[] => {
  const zones: string[] = [];
  (json.features ?? []).forEach((f) => {
    const zone = f.properties?.ZONE;
    if (typeof zone === 'string' && zone.length > 0 && !zones.includes(zone)) {
      zones.push(zone);
    }
  });
  return zones;
};

const fetchBecZonesByCqlFilter = async (cqlFilter: string): Promise<string[]> => {
  if (cqlFilter.length > MAX_CQL_CHARS) {
    throw new Error(
      'The collection area is too detailed to validate. '
      + 'Simplify the polygon (fewer vertices) and try again.'
    );
  }
  const params = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeNames: BEC_QUERY_LAYER,
    outputFormat: 'application/json',
    propertyName: 'ZONE',
    CQL_FILTER: cqlFilter
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BEC_WFS_TIMEOUT_MS);

  try {
    const json = await getOpenmapsJson<WfsFeatureCollection>(params, controller.signal);
    return distinctZonesFromFeatureCollection(json);
  } catch (error) {
    if (isOpenmapsAbort(error)) {
      throw new Error(`WFS GetFeature timed out after ${BEC_WFS_TIMEOUT_MS / 1000} seconds`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Serialize a single GeoJSON polygon ring (`Position[]`) as WKT ring
 * syntax: `(x1 y1, x2 y2, ...)`. Coordinates are reprojected from
 * WGS84 (input CRS) to BC Albers (EPSG:3005) because DataBC's GeoServer
 * interprets CQL_FILTER input geometry in the layer's native CRS
 * regardless of the `SrsName` parameter (empirically verified against
 * openmaps WFS — `SrsName=EPSG:4326` is respected for output but NOT for
 * filter input geometry).
 */
const ringToBcAlbersWkt = (ring: Position[]): string => {
  const pairs = ring.map((coord) => {
    const [lng, lat] = coord;
    const [easting, northing] = wgs84ToBcAlbers([lng, lat]);
    return `${easting} ${northing}`;
  });
  return `(${pairs.join(', ')})`;
};

/**
 * Serialize a GeoJSON `MultiPolygon` (in WGS84) as a WKT `MULTIPOLYGON`
 * in BC Albers (EPSG:3005). Each inner ring becomes a WKT ring; each
 * polygon becomes a parenthesised group of rings; all polygons are
 * concatenated inside the outer `MULTIPOLYGON(...)` envelope.
 */
const multiPolygonToBcAlbersWkt = (geometry: MultiPolygon): string => {
  const polygonWkts = geometry.coordinates.map((polygon) => {
    const ringWkts = polygon.map(ringToBcAlbersWkt);
    return `(${ringWkts.join(', ')})`;
  });
  return `MULTIPOLYGON(${polygonWkts.join(', ')})`;
};

const becCql = (predicate: BecCqlPredicate, wkt: string) => `${predicate}(GEOMETRY,${wkt})`;

const pointToBcAlbersWkt = (coord: Position): string => {
  const [lng, lat] = coord;
  const [easting, northing] = wgs84ToBcAlbers([lng, lat]);
  return `${easting} ${northing}`;
};

const pointsToBcAlbersMultiPointWkt = (points: Position[]): string => `MULTIPOINT(${points.map((point) => `(${pointToBcAlbersWkt(point)})`).join(', ')})`;

const pointKey = (coord: Position) => {
  const [lng, lat] = coord;
  return `${lng.toFixed(7)},${lat.toFixed(7)}`;
};

const pointInRing = ([lng, lat]: Position, ring: Position[]) => {
  if (ring.length < 4) return false;

  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [lngI, latI] = ring[i];
    const [lngJ, latJ] = ring[j];
    const crossesLatitude = (latI > lat) !== (latJ > lat);
    const intersects = crossesLatitude
      && lng < ((lngJ - lngI) * (lat - latI)) / (latJ - latI) + lngI;
    if (intersects) inside = !inside;
  }
  return inside;
};

const pointInPolygonRings = (point: Position, rings: Position[][]) => {
  const [outerRing, ...holes] = rings;
  if (!outerRing || !pointInRing(point, outerRing)) return false;
  return !holes.some((hole) => pointInRing(point, hole));
};

const getRingBounds = (ring: Position[]) => {
  const lngs = ring.map(([lng]) => lng);
  const lats = ring.map(([, lat]) => lat);
  return {
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats)
  };
};

const getInteriorSamplePoints = (geometry: MultiPolygon): Position[] => {
  const samples: Position[] = [];
  const seen = new Set<string>();

  const addSample = (point: Position, rings: Position[][]) => {
    if (!pointInPolygonRings(point, rings)) return;
    const key = pointKey(point);
    if (seen.has(key)) return;
    seen.add(key);
    samples.push(point);
  };

  geometry.coordinates.forEach((polygon) => {
    const outerRing = polygon[0];
    if (!outerRing || outerRing.length < 4) return;

    const {
      minLng, maxLng, minLat, maxLat
    } = getRingBounds(outerRing);
    const lngSpan = maxLng - minLng;
    const latSpan = maxLat - minLat;

    if (lngSpan === 0 || latSpan === 0) return;

    addSample([minLng + lngSpan / 2, minLat + latSpan / 2], polygon);

    const gridSize = 5;
    for (let row = 1; row <= gridSize; row += 1) {
      for (let col = 1; col <= gridSize; col += 1) {
        addSample([
          minLng + (lngSpan * col) / (gridSize + 1),
          minLat + (latSpan * row) / (gridSize + 1)
        ], polygon);
      }
    }
  });

  return samples.slice(0, 50);
};

const fetchBecZonesForInteriorSamples = async (geometry: MultiPolygon): Promise<string[]> => {
  const samples = getInteriorSamplePoints(geometry);
  if (samples.length === 0) return [];
  return fetchBecZonesByCqlFilter(
    becCql('INTERSECTS', pointsToBcAlbersMultiPointWkt(samples))
  );
};

/**
 * Query the DataBC WFS for the distinct BEC zone codes whose polygons
 * intersect the supplied AOI feature.
 *
 * This is a client-side implementation of the legacy Oracle
 * `SPR_SPATIAL_UTILS.BEC_INTERSECT` stored proc — the seedlot collection
 * area BEC derivation that the legacy Struts SPAR code performed
 * server-side via JDBC. For the React rewrite we follow SILVA's
 * architectural pattern (client does geospatial work, calls openmaps
 * directly, backend stays geospatial-dumb) — see the 2026-04-07
 * Confluence CWM evaluation report for the full rationale.
 *
 * The returned zone codes travel with the polygon in the registration
 * wizard handoff (`collectionAreaResult`) and are applied to the B-class
 * collection form; the backend does not recompute BEC on submit.
 *
 * @param feature AOI as a GeoJSON `Feature<MultiPolygon>` in WGS84.
 * @returns Distinct `ZONE` codes (e.g. `["CDF", "CWH"]`) in first-seen
 *   order. Empty array if the intersection has no matches.
 * @throws Error on timeout or non-2xx HTTP response; the SPAR save flow
 *   fails closed because legacy SPAR must not save collection areas that
 *   cross more than one BEC zone.
 */
/**
 * Build the WFS GetFeature URL for a single BEC zone polygon, looked
 * up by its `MAP_LABEL` (e.g. "IDFmw1"). Exported separately from the
 * fetch wrapper so unit tests can assert the URL/CQL composition
 * without going to the network.
 */
export const buildBecZoneByMapLabelParams = (mapLabel: string): URLSearchParams => {
  if (!isCqlSafeIdentifier(mapLabel)) {
    throw new Error('Invalid BEC map label');
  }
  return new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeNames: `pub:${BEC_QUERY_LAYER}`,
    outputFormat: 'application/json',
    srsName: 'EPSG:4326',
    CQL_FILTER: `MAP_LABEL=${cqlQuoted(mapLabel)}`
  });
};

export const buildBecZoneByMapLabelUrl = (mapLabel: string): string => (
  buildOpenmapsProxyUrl(buildBecZoneByMapLabelParams(mapLabel))
);

/**
 * Fetch a single BEC zone polygon by its `MAP_LABEL` for the AOUCBST
 * side panel's click-to-zoom flow. Mirrors the legacy
 * `Sparmap.showBECFeatureInfoOnMapByBecCode` (sparmap.js:130-174)
 * which pulled the polygon, highlighted it, and zoomed.
 *
 * Returns `null` when:
 *   - the WFS responds with zero matching features
 *   - the WFS call returns a non-2xx (fail-open so the panel stays
 *     interactive even if DataBC is rate-limiting)
 *
 * Throws only for timeout / network errors that the caller may want
 * to surface as a notification.
 */
export const fetchBecZoneByMapLabel = async (
  mapLabel: string
): Promise<Feature<Polygon | MultiPolygon, BecZoneProperties> | null> => {
  if (!mapLabel || !isCqlSafeIdentifier(mapLabel)) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BEC_WFS_TIMEOUT_MS);

  let fc: FeatureCollection;
  try {
    fc = await getOpenmapsJson<FeatureCollection>(
      buildBecZoneByMapLabelParams(mapLabel),
      controller.signal
    );
  } catch (err) {
    if (isOpenmapsAbort(err)) {
      throw new Error(
        `BEC WFS lookup timed out after ${BEC_WFS_TIMEOUT_MS / 1000} seconds`
      );
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
  const first = fc.features?.[0];
  if (!first || !first.geometry) return null;
  const geomType = (first.geometry as { type?: string }).type;
  if (geomType !== 'Polygon' && geomType !== 'MultiPolygon') return null;
  return first as Feature<Polygon | MultiPolygon, BecZoneProperties>;
};

export const fetchBecZonesIntersecting = async (
  feature: Feature<MultiPolygon>
): Promise<string[]> => {
  const wkt = multiPolygonToBcAlbersWkt(feature.geometry);
  const intersectingZones = await fetchBecZonesByCqlFilter(becCql('INTERSECTS', wkt));

  if (intersectingZones.length <= 1) {
    return intersectingZones;
  }

  const containingZones = await fetchBecZonesByCqlFilter(becCql('CONTAINS', wkt));
  if (containingZones.length > 0) {
    return containingZones;
  }

  const sampleZones = await fetchBecZonesForInteriorSamples(feature.geometry);
  return sampleZones.length > 0 ? sampleZones : intersectingZones;
};

export interface BecVariant {
  mapLabel: string;
  zone: string;
  subzone: string | null;
  variant: string | null;
}

const BEC_VARIANT_TIMEOUT_MS = 15000;

/** Map the first WFS feature's BEC attributes into a BecVariant, or null. */
export const becVariantFromFeatureCollection = (
  json: { features?: Array<{ properties?: Record<string, unknown> }> }
): BecVariant | null => {
  const p = json.features?.[0]?.properties;
  if (!p) {
    return null;
  }
  const mapLabel = typeof p.MAP_LABEL === 'string' ? p.MAP_LABEL : '';
  const zone = typeof p.ZONE === 'string' ? p.ZONE : '';
  if (!mapLabel && !zone) {
    return null;
  }
  return {
    mapLabel: mapLabel || zone,
    zone,
    subzone: typeof p.SUBZONE === 'string' ? p.SUBZONE : null,
    variant: typeof p.VARIANT === 'string' ? p.VARIANT : null
  };
};

/** Fetch the BEC variant (MAP_LABEL) at a WGS84 centroid; fail-soft to null. */
export const fetchBecVariantAt = async (centroid: Position): Promise<BecVariant | null> => {
  const params = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeNames: BEC_QUERY_LAYER,
    outputFormat: 'application/json',
    propertyName: 'MAP_LABEL,ZONE,SUBZONE,VARIANT',
    count: '1',
    CQL_FILTER: `INTERSECTS(GEOMETRY,POINT(${pointToBcAlbersWkt(centroid)}))`
  });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BEC_VARIANT_TIMEOUT_MS);
  try {
    const json = await getOpenmapsJson<{ features?: Array<{ properties?: Record<string, unknown> }> }>(
      params,
      controller.signal
    );
    return becVariantFromFeatureCollection(json);
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};
