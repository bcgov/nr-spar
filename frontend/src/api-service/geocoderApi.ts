import type { FeatureCollection, Point } from 'geojson';

/**
 * One match from the BC Gov geocoder API, flattened into the shape the
 * SearchControl and useGeocoderSearch hook consume. Kept intentionally
 * flat (no nested GeoJSON properties) so the component layer doesn't
 * have to know about the upstream GeoJSON envelope.
 */
export interface GeocoderResult {
  fullAddress: string;
  latitude: number;
  longitude: number;
  score: number;
}

/**
 * Public BC Gov geocoder endpoint. No authentication — this is
 * deliberately NOT routed through the backend axios wrapper because
 * that wrapper attaches a Bearer token and the geocoder rejects any
 * Authorization header it doesn't recognise. See Batch 3 plan.
 */
export const BC_GEOCODER_URL = 'https://geocoder.api.gov.bc.ca/addresses.json';

/**
 * Query the BC Gov geocoder for free-text location matches. Returns an
 * empty array when the query is too short (< 3 chars) so callers can
 * safely fire this on every keystroke without hammering the API.
 *
 * The geocoder is a public HTTPS endpoint and is generally CORS-friendly
 * per BC Gov digital standards; if a deployment environment hits a CORS
 * wall, a backend proxy would be the follow-up fix. For the POC we rely
 * on the public endpoint directly.
 *
 * `query` is a free-text address or place name (e.g. "Victoria BC").
 * `maxResults` caps the number of matches and defaults to 5 to match the
 * legacy CWM geocoder UX which showed a short typeahead list. Resolves to
 * an array of mapped matches (may be empty).
 *
 * @throws Error when the HTTP call fails (non-2xx, network error, etc.).
 */
export const searchLocation = async (
  query: string,
  maxResults = 5
): Promise<GeocoderResult[]> => {
  if (!query || query.length < 3) return [];

  const params = new URLSearchParams({
    addressString: query,
    maxResults: String(maxResults),
    outputSRS: '4326',
    echo: 'true',
    brief: 'true'
  });

  const res = await fetch(`${BC_GEOCODER_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Geocoder API returned ${res.status}`);
  }

  const json = (await res.json()) as FeatureCollection<Point>;
  return (json.features ?? [])
    .filter((f) => f.geometry && f.geometry.type === 'Point')
    .map((f) => {
      const [lng, lat] = (f.geometry as Point).coordinates;
      return {
        fullAddress: String(f.properties?.fullAddress ?? 'Unknown'),
        latitude: lat,
        longitude: lng,
        score: Number(f.properties?.score ?? 0)
      };
    });
};
