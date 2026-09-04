import { useQuery } from '@tanstack/react-query';
import type { FeatureCollection } from 'geojson';

import { getOpenmapsJson } from '../api-service/openmapsProxy';

interface UseWfsGetFeatureParams {
  /** WFS typeName, e.g. 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY' */
  layer: string;
  /** CQL_FILTER expression, e.g. 'INTERSECTS(GEOMETRY, POINT(1200000 700000))' */
  cqlFilter: string;
  /** If false, the query is disabled (no fetch fires). */
  enabled: boolean;
}

/**
 * react-query wrapper for a single WFS GetFeature call. Goes through the
 * authenticated SPAR OpenMaps proxy so the browser does not hit
 * openmaps.gov.bc.ca (no CORS headers on that origin).
 */
export const useWfsGetFeature = (
  { layer, cqlFilter, enabled }: UseWfsGetFeatureParams
) => useQuery<FeatureCollection>({
  queryKey: ['wfs-get-feature', layer, cqlFilter],
  queryFn: async () => {
    const params = new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeNames: layer,
      outputFormat: 'application/json',
      CQL_FILTER: cqlFilter
    });
    return getOpenmapsJson<FeatureCollection>(params);
  },
  enabled,
  staleTime: 5 * 60 * 1000
});
