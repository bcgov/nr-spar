import type { Feature, MultiPolygon, Position } from 'geojson';

import { SPZ_QUERY_LAYER } from '../shared-constants/spar-map';
import { cqlQuoted, isCqlSafeIdentifier } from '../utils/CqlUtils';
import { multiPolygonToBcAlbersWkt, pointToBcAlbersWkt } from './becZonesApi';
import { getOpenmapsJson } from './openmapsClient';

const SPZ_WFS_TIMEOUT_MS = 15000;

interface SpzFeatureCollection {
  features?: Array<{ properties?: { SEED_PLAN_ZONE_CODE?: unknown } }>;
}

/**
 * Class B zones that apply to a species: the species' own zones plus those
 * with no species, which apply to every species. Mirrors oracle-api's
 * `SeedPlanZoneRepository.findForSpeciesOrAllSpecies`.
 */
export const buildClassBSpzCql = (geometryWkt: string, vegCode: string): string => (
  `INTERSECTS(GEOMETRY,${geometryWkt})`
  + " AND GENETIC_CLASS_CODE='B'"
  + ` AND (VEGETATION_CODE=${cqlQuoted(vegCode)} OR VEGETATION_CODE IS NULL)`
);

const distinctSpzCodes = (json: SpzFeatureCollection): string[] => {
  const codes: string[] = [];
  (json.features ?? []).forEach((f) => {
    const code = f.properties?.SEED_PLAN_ZONE_CODE;
    if (typeof code === 'string' && code.length > 0 && !codes.includes(code)) {
      codes.push(code);
    }
  });
  return codes;
};

const fetchSpzCodes = async (cqlFilter: string, count?: number): Promise<string[]> => {
  const params = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeNames: SPZ_QUERY_LAYER,
    outputFormat: 'application/json',
    propertyName: 'SEED_PLAN_ZONE_CODE',
    CQL_FILTER: cqlFilter
  });
  if (count) {
    params.set('count', String(count));
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SPZ_WFS_TIMEOUT_MS);
  try {
    return distinctSpzCodes(await getOpenmapsJson<SpzFeatureCollection>(params, controller.signal));
  } finally {
    clearTimeout(timeoutId);
  }
};

/** Class B seed planning zone under a WGS84 point; fail-soft to null. */
export const fetchClassBSpzAt = async (
  point: Position,
  vegCode: string
): Promise<string | null> => {
  if (!isCqlSafeIdentifier(vegCode)) return null;
  try {
    const codes = await fetchSpzCodes(
      buildClassBSpzCql(`POINT(${pointToBcAlbersWkt(point)})`, vegCode),
      1
    );
    return codes[0] ?? null;
  } catch {
    return null;
  }
};

/** Distinct class B seed planning zones a collection area touches; fail-soft to []. */
export const fetchClassBSpzCodesIntersecting = async (
  feature: Feature<MultiPolygon>,
  vegCode: string
): Promise<string[]> => {
  if (!isCqlSafeIdentifier(vegCode)) return [];
  try {
    return await fetchSpzCodes(
      buildClassBSpzCql(multiPolygonToBcAlbersWkt(feature.geometry), vegCode)
    );
  } catch {
    return [];
  }
};
