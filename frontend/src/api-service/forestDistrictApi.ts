import type { Position } from 'geojson';

import { wgs84ToBcAlbers } from '../legacy_translated/SPR_SPATIAL_UTILS';
import { buildOpenmapsProxyUrl, getOpenmapsJson, isOpenmapsAbort } from './openmapsProxy';

export const FOREST_DISTRICT_LAYER = 'WHSE_ADMIN_BOUNDARIES.ADM_NR_DISTRICTS_SPG';
const WFS_TIMEOUT_MS = 15000;

interface DistrictFeatureCollection {
  features?: Array<{ properties?: { DISTRICT_NAME?: unknown } }>;
}

/** Pull the first feature's DISTRICT_NAME, or null. */
export const districtNameFromFeatureCollection = (
  json: DistrictFeatureCollection
): string | null => {
  const name = json.features?.[0]?.properties?.DISTRICT_NAME;
  return typeof name === 'string' && name.length > 0 ? name : null;
};

/** WFS GetFeature params for the NR district intersecting the given WGS84 point. */
export const buildForestDistrictParams = (centroid: Position): URLSearchParams => {
  const [lng, lat] = centroid;
  const [easting, northing] = wgs84ToBcAlbers([lng, lat]);
  return new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeNames: FOREST_DISTRICT_LAYER,
    outputFormat: 'application/json',
    propertyName: 'DISTRICT_NAME',
    count: '1',
    CQL_FILTER: `INTERSECTS(SHAPE,POINT(${easting} ${northing}))`
  });
};

export const buildForestDistrictUrl = (centroid: Position): string => (
  buildOpenmapsProxyUrl(buildForestDistrictParams(centroid))
);

/** Fetch the NR forest-district name for a centroid; fail-soft to null. */
export const fetchForestDistrict = async (centroid: Position): Promise<string | null> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WFS_TIMEOUT_MS);
  try {
    const json = await getOpenmapsJson<DistrictFeatureCollection>(
      buildForestDistrictParams(centroid),
      controller.signal
    );
    return districtNameFromFeatureCollection(json);
  } catch (err) {
    if (isOpenmapsAbort(err)) {
      return null;
    }
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};
