import axios from 'axios';

import api from './api';
import ApiConfig from './ApiConfig';

/**
 * Authenticated SPAR proxy for DataBC OpenMaps JSON (WFS GetFeature and
 * WMS GetLegendGraphic). Tiles still load as <img> from openmaps.gov.bc.ca
 * and are allowlisted in the Caddy CSP img-src directive.
 */
export const OPENMAPS_PROXY_URL = ApiConfig.openmaps;

export const isOpenmapsAbort = (err: unknown): boolean => {
  if (err instanceof DOMException && err.name === 'AbortError') {
    return true;
  }
  return axios.isAxiosError(err) && err.code === 'ERR_CANCELED';
};

/** Build the SPAR proxy URL from OpenMaps query params (for tests / callers). */
export const buildOpenmapsProxyUrl = (params: URLSearchParams): string => (
  `${OPENMAPS_PROXY_URL}?${params.toString()}`
);

/**
 * GET /api/openmaps with the caller's JWT. Throws on abort so callers can
 * surface a timeout; axios non-2xx errors are rethrown as-is.
 */
export const getOpenmapsJson = async <T>(
  params: URLSearchParams,
  signal?: AbortSignal
): Promise<T> => {
  const { data } = await api.get(OPENMAPS_PROXY_URL, {
    params: Object.fromEntries(params.entries()),
    signal
  });
  return data as T;
};
