/**
 * Browser-direct client for DataBC OpenMaps JSON (WFS GetFeature and WMS
 * GetLegendGraphic). Tiles also load straight from openmaps.gov.bc.ca; both
 * hosts are allowlisted in the Caddy CSP (connect-src / img-src).
 *
 * Uses plain `fetch` rather than the shared axios instance so the SPAR JWT is
 * never sent to a third party, and so requests stay CORS "simple" (no
 * preflight).
 */
const OPENMAPS_BASE_URL = 'https://openmaps.gov.bc.ca/geo/pub';

/** Cap applied when a WFS caller omits `count`, so no query is unbounded. */
const DEFAULT_MAX_FEATURES = '5000';

const isWms = (params: URLSearchParams): boolean => (
  (params.get('service') ?? '').toUpperCase() === 'WMS'
);

const endpointFor = (params: URLSearchParams): string => (
  `${OPENMAPS_BASE_URL}/${isWms(params) ? 'wms' : 'wfs'}`
);

export const isOpenmapsAbort = (err: unknown): boolean => (
  err instanceof DOMException && err.name === 'AbortError'
);

/** Build the OpenMaps GET URL for a query (for tests / callers). */
export const buildOpenmapsUrl = (params: URLSearchParams): string => (
  `${endpointFor(params)}?${params.toString()}`
);

/**
 * Fetch OpenMaps JSON. WFS queries are POSTed form-encoded because a
 * collection-area `CQL_FILTER` carries the polygon as WKT and outgrows any URL
 * length limit well before it outgrows the vertex cap. Legend requests are
 * small and stay on GET.
 *
 * Throws on abort so callers can surface a timeout, and on any non-2xx
 * response.
 */
export const getOpenmapsJson = async <T>(
  params: URLSearchParams,
  signal?: AbortSignal
): Promise<T> => {
  let response: Response;
  if (isWms(params)) {
    response = await fetch(buildOpenmapsUrl(params), { signal });
  } else {
    const body = new URLSearchParams(params);
    if (!body.has('count') && !body.has('maxFeatures')) {
      body.set('count', DEFAULT_MAX_FEATURES);
    }
    response = await fetch(endpointFor(params), { method: 'POST', body, signal });
  }
  if (!response.ok) {
    throw new Error(`OpenMaps request failed with HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
};
