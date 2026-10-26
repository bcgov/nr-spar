import area from '@turf/area';
import type { Feature, MultiPolygon } from 'geojson';

import { fetchBecVariantAt } from '../../../api-service/becZonesApi';
import { fetchPolygonElevationRange } from '../../../api-service/elevationApi';
import { meanLatLng } from '../../../components/SeedlotRegistrationSteps/CollectionStep/collectionAreaDerivations';
import type { CollectionAreaResult } from '../../../types/SparMapTypes';
import { featureRadiusKm } from './AoiToolbar/aoiValidation';

export const ELEVATION_LOOKUP_FAILED_MESSAGE = 'Please enter it manually.';

/**
 * Derive the values the seedlot registration wizard needs from a drawn
 * collection-area polygon. Elevation and BEC variant are fetched from
 * DataBC; both fail soft so a transient WFS outage never blocks handing the
 * geometry back to the form. A failed elevation lookup is reported through
 * `elevationError` rather than looking the same as "no elevation data".
 *
 * `becZones` is passed in by the caller because the AOI submit flow has
 * already computed the intersecting zones for its single-zone validation
 * check — re-deriving here would double the WFS round-trips.
 */
export const deriveCollectionAreaResult = async (
  feature: Feature<MultiPolygon>,
  becZones: string[],
  polygonCount: number
): Promise<CollectionAreaResult> => {
  const mean = meanLatLng(feature);
  const centroid = mean ? [mean.lng, mean.lat] : null;

  let elevationError: string | null = null;
  const [elevation, becVariant] = await Promise.all([
    fetchPolygonElevationRange(feature).catch(() => {
      elevationError = ELEVATION_LOOKUP_FAILED_MESSAGE;
      return null;
    }),
    centroid
      ? fetchBecVariantAt(centroid).catch(() => null)
      : Promise.resolve(null)
  ]);

  return {
    geoJson: JSON.stringify(feature),
    polygonCount,
    areaHectares: Math.round((area(feature) / 10000) * 100) / 100,
    radiusKm: Math.round(featureRadiusKm(feature) * 10) / 10,
    meanLat: mean ? mean.lat : null,
    meanLng: mean ? mean.lng : null,
    elevationMinM: elevation ? Math.round(elevation.minM) : null,
    elevationMaxM: elevation ? Math.round(elevation.maxM) : null,
    elevationError,
    becZones,
    becVariant
  };
};
