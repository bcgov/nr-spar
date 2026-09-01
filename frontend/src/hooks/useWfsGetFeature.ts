import { useQuery } from '@tanstack/react-query';
import type { FeatureCollection } from 'geojson';

import { OPENMAPS_WFS_URL } from '../shared-constants/spar-map';

interface UseWfsGetFeatureParams {
  /** WFS typeName, e.g. 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY' */
  layer: string;
  /** CQL_FILTER expression, e.g. 'INTERSECTS(GEOMETRY, POINT(1200000 700000))' */
  cqlFilter: string;
  /** If false, the query is disabled (no fetch fires). */
  enabled: boolean;
}

/**
 * react-query wrapper for a single WFS GetFeature call against
 * openmaps.gov.bc.ca. Returns GeoJSON. Caches for 5 minutes under a key that
 * includes the layer and CQL filter.
 *
 * NOTE: CORS status for openmaps.gov.bc.ca from a localhost / AWS Amplify
 * origin is unknown as of this writing (investigation deferred). If CORS
 * blocks the real call, the fallback is to proxy through the FDS backend.
 */
export const useWfsGetFeature = (
  { layer, cqlFilter, enabled }: UseWfsGetFeatureParams
) => useQuery<FeatureCollection>({
  queryKey: ['wfs-get-feature', layer, cqlFilter],
  queryFn: async () => {
    const url = new URL(OPENMAPS_WFS_URL);
    url.searchParams.set('service', 'WFS');
    url.searchParams.set('version', '2.0.0');
    url.searchParams.set('request', 'GetFeature');
    url.searchParams.set('typeNames', layer);
    url.searchParams.set('outputFormat', 'application/json');
    url.searchParams.set('CQL_FILTER', cqlFilter);

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`WFS GetFeature failed: ${res.status}`);
    }
    return res.json();
  },
  enabled,
  staleTime: 5 * 60 * 1000
});
