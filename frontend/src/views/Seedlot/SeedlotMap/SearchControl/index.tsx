import React, { useState } from 'react';
import {
  Search,
  ContainedList,
  ContainedListItem
} from '@carbon/react';

import { useSparMap } from '../../../../contexts/SparMapContext';
import { useGeocoderSearch } from './useGeocoderSearch';

/**
 * Free-text location search powered by the BC Gov geocoder. Rendered
 * OUTSIDE the `<MapContainer>` — typically at the top of the SeedlotMap
 * view — and depends on `<ViewControl>` being mounted inside the map to
 * register the `flyToLocation` bridge callback.
 *
 * Flow mirrors the legacy CWM geocoder widget:
 *   1. User types into the Carbon Search box (controlled input).
 *   2. `useGeocoderSearch` debounces the query ~300 ms and fetches.
 *   3. Up to 5 matches render below the input as a Carbon
 *      `ContainedList`; each row shows the full address + match score.
 *   4. Clicking a match fires `flyToLocation(lat, lng, 14)` and clears
 *      the search box so the user can start a new search immediately.
 *
 * Error state (CORS wall, network failure, non-2xx response) is
 * surfaced as a friendly "Search unavailable" message — the map is
 * still usable without the search feature.
 */
const SearchControl = () => {
  const [query, setQuery] = useState('');
  const { results, loading, error } = useGeocoderSearch(query);
  const { flyToLocation } = useSparMap();

  const handleSelect = (lat: number, lng: number) => {
    // Gate on the bridge callback — `<ViewControl>` registers it on
    // mount, but the gate guards against the edge case where the map
    // hasn't been fully wired yet (e.g. first render before the effect
    // runs).
    flyToLocation?.(lat, lng, 14);
    setQuery('');
  };

  return (
    <div className="search-control" data-testid="search-control">
      <Search
        id="spar-geocoder-search"
        labelText="Search for a location"
        placeholder="Search BC address or place name..."
        value={query}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        onClear={() => setQuery('')}
        size="md"
        data-testid="search-control-input"
      />
      {loading && (
        <p className="search-control__hint" data-testid="search-control-loading">
          Searching...
        </p>
      )}
      {error && (
        <p className="search-control__error" data-testid="search-control-error">
          Search unavailable:
          {' '}
          {error}
        </p>
      )}
      {results.length > 0 && (
        <ContainedList
          label="Results"
          kind="on-page"
          data-testid="search-control-results"
        >
          {results.map((r, i) => (
            <ContainedListItem
              // Compose the key from the address + coordinates so
              // duplicate address strings (rare but possible for the
              // same street number in two municipalities) still keep a
              // stable React identity without relying on the array index.
              key={`${r.fullAddress}-${r.latitude},${r.longitude}`}
              onClick={() => handleSelect(r.latitude, r.longitude)}
              data-testid={`search-result-${i}`}
            >
              {r.fullAddress}
              <span className="search-control__score">
                {' '}
                (
                {Math.round(r.score)}
                %)
              </span>
            </ContainedListItem>
          ))}
        </ContainedList>
      )}
    </div>
  );
};

export default SearchControl;
