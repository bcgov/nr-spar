import area from '@turf/area';
import type { Feature, MultiPolygon } from 'geojson';

import { fetchBecVariantAt } from '../../../api-service/becZonesApi';
import { fetchPolygonElevationRange } from '../../../api-service/elevationApi';
import { meanLatLng } from '../../../components/SeedlotRegistrationSteps/CollectionStep/collectionAreaDerivations';
import type { CollectionAreaResult } from '../../../types/SparMapTypes';

/**
 * Derive the values the seedlot registration wizard needs from a drawn
 * collection-area polygon. Elevation and BEC variant are fetched from
 * DataBC; both fail soft to null so a transient WFS outage never blocks
 * handing the geometry back to the form.
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

  const [elevation, becVariant] = await Promise.all([
    fetchPolygonElevationRange(feature).catch(() => null),
    centroid
      ? fetchBecVariantAt(centroid).catch(() => null)
      : Promise.resolve(null)
  ]);

  return {
    geoJson: JSON.stringify(feature),
    polygonCount,
    areaHectares: Math.round((area(feature) / 10000) * 100) / 100,
    meanLat: mean ? mean.lat : null,
    meanLng: mean ? mean.lng : null,
    elevationMinM: elevation ? Math.round(elevation.minM) : null,
    elevationMaxM: elevation ? Math.round(elevation.maxM) : null,
    becZones,
    becVariant
  };
};
