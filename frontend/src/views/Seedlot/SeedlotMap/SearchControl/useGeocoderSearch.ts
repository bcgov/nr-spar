import { useEffect, useState } from 'react';
import {
  searchLocation,
  type GeocoderResult
} from '../../../../api-service/geocoderApi';

/**
 * Debounce window (ms) applied between the last keystroke and the
 * actual fetch to the BC Gov geocoder. 300 ms matches the typeahead
 * responsiveness of the legacy CWM geocoder box while keeping requests
 * well under the public API's fair-use threshold.
 */
const DEBOUNCE_MS = 300;

/**
 * Minimum query length before we bother hitting the geocoder. Anything
 * shorter than this returns no matches from the BC Gov API anyway, so
 * short-circuiting here saves a round-trip and avoids flashing a
 * transient "No results" state while the user is mid-type.
 */
const MIN_QUERY_LENGTH = 3;

interface GeocoderSearchState {
  results: GeocoderResult[];
  loading: boolean;
  error: string | null;
}

/**
 * Debounced wrapper around `searchLocation`. Accepts the live query
 * string from a controlled Carbon `Search` input and returns the
 * current match list along with loading / error flags. Cancels any
 * in-flight debounce timer on unmount or query change so late responses
 * don't clobber fresh state.
 */
export const useGeocoderSearch = (query: string): GeocoderSearchState => {
  const [results, setResults] = useState<GeocoderResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setError(null);
      setLoading(false);
      return undefined;
    }

    // `cancelled` guards against a stale response resolving after the
    // user has already typed more characters. We don't have AbortController
    // wiring for fetch() in this POC layer, so a local flag is enough.
    let cancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const hits = await searchLocation(query);
        if (!cancelled) {
          setResults(hits);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  return { results, loading, error };
};
