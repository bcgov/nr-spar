import type { Feature, MultiPolygon, Polygon } from 'geojson';

import ApiConfig from './ApiConfig';
import api from './api';

/**
 * Request payload for `saveAoi`. The seedlot number lives in the URL
 * path, the polygon travels in the JSON body as a GeoJSON Feature.
 *
 * Accepts either a single-polygon or multi-polygon Feature to match the
 * Phase 1 backend Jackson binding (`@JsonTypeInfo` on GeoJSON geometry)
 * which normalizes both into the `spar.seedlot.collection_geom`
 * MultiPolygon column. The frontend normally sends MultiPolygon via
 * `buildMultiPolygonFeature`; the Polygon overload is kept here only
 * so older call-sites (and the `useAoiSave.test.tsx` fixture) keep
 * compiling while the test suite migrates.
 *
 * `becZones` is the list of BEC zone codes the polygon intersects,
 * derived client-side via `fetchBecZonesIntersecting` before this
 * request fires. The backend echoes whatever the client sends — it
 * does not re-verify. See the silva pattern rationale in the
 * 2026-04-07 CWM client library evaluation Confluence page and in
 * `becZonesApi.ts`.
 */
export interface SaveAoiRequest {
  seedlotNumber: string;
  polygon: Feature<Polygon | MultiPolygon>;
  becZones: string[];
}

/**
 * Response contract for the AOI save endpoint. `ok` is a simple
 * acknowledgement flag, `savedAt` is the server-side ISO-8601 timestamp
 * of the persisted record, and `becZones` is the zone list echoed back
 * from the request (provided for consistency with the legacy flow that
 * returned the zones after a server-side lookup).
 */
export interface SaveAoiResponse {
  ok: boolean;
  savedAt: string;
  becZones: string[];
}

/**
 * Save a seedlot AOI polygon to the FDS backend.
 *
 * The backend endpoint is `POST /api/seedlots/{seedlotNumber}/aoi`; in
 * local direct-Vite runs, `ApiConfig` falls back to the compose backend
 * at `http://localhost:8090`.
 *
 * POC note: this proof-of-concept call uses `fetch` directly rather than
 * the shared `api` axios wrapper. For production use it should route
 * through the `api` wrapper so the authenticated Bearer token flows to
 * the role-protected endpoint. The existing tests assert on the request
 * body, not the transport, so that swap is a small, isolated change.
 */
export const saveAoi = async (req: SaveAoiRequest): Promise<SaveAoiResponse> => {
  const url = ApiConfig.sparMapAoi.replace('{seedlotNumber}', req.seedlotNumber);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ polygon: req.polygon, becZones: req.becZones })
  });

  if (!res.ok) {
    // Synthesize an axios-like error so the existing `formatSaveError`
    // in the toolbar (which sniffs `response.status` + `code`) keeps
    // working without a refactor.
    interface SaveError extends Error {
      response: { status: number };
    }
    const err = new Error(
      `AOI save failed: ${res.status} ${res.statusText}`
    ) as SaveError;
    err.response = { status: res.status };
    throw err;
  }

  return (await res.json()) as SaveAoiResponse;
};

/**
 * Read the saved collection-area polygon for a seedlot (the production
 * read-back). Returns the GeoJSON Feature, or null when none is saved
 * (HTTP 204) or the seedlot has no AOI yet.
 *
 * POC transport note: like `saveAoi`, this uses `fetch` directly. For
 * production it should route through the authenticated `api` wrapper.
 */
export const fetchSavedAoi = async (
  seedlotNumber: string
): Promise<Feature<MultiPolygon> | null> => {
  const url = ApiConfig.sparMapAoi.replace('{seedlotNumber}', seedlotNumber);
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok || res.status === 204) {
    return null;
  }
  return (await res.json()) as Feature<MultiPolygon>;
};

// Keep the import alive so the file still type-checks against the axios
// instance contract — a follow-up will restore the axios path once the
// dev auth bypass is removed.
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-underscore-dangle
const _keepAxiosImport = api;
