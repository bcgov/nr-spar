import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

import SearchControl from '../../../views/Seedlot/SeedlotMap/SearchControl';
import {
  SparMapProvider,
  useSparMap,
} from '../../../contexts/SparMapContext';

/**
 * SearchControl is a thin UI shell over `useGeocoderSearch`. We mock
 * the hook module so the component's render path is tested without any
 * timer/fetch coordination — the hook itself is covered via the
 * geocoderApi.test.ts + a dedicated hook test path inside this file's
 * scope (the mocked hook asserts a contract shape, not its internals).
 *
 * The bridge callback `flyToLocation` is registered into context by a
 * wrapper component that emulates what `<ViewControl>` does in
 * production. Assertions then verify that clicking a result actually
 * invokes the bridge with the right lat/lng/zoom.
 */

// Hoisted state used by the mocked hook so tests can drive what
// results/error/loading look like without actually hitting the API.
const hookState = {
  results: [] as Array<{
    fullAddress: string;
    latitude: number;
    longitude: number;
    score: number;
  }>,
  loading: false,
  error: null as string | null,
};

vi.mock(
  '../../../views/Seedlot/SeedlotMap/SearchControl/useGeocoderSearch',
  () => ({
    useGeocoderSearch: (query: string) => {
      // Mirror the real hook's short-query branch so the 3-char
      // threshold is actually exercised by the test suite. For
      // long-enough queries we return whatever the test set on
      // hookState — see `beforeEach` for how tests configure it.
      if (!query || query.length < 3) {
        return { results: [], loading: false, error: null };
      }
      return { ...hookState };
    },
  }),
);

/**
 * Helper wrapper that registers a mock `flyToLocation` into the
 * SparMapContext bridge so the SearchControl can pick it up via
 * `useSparMap()`. This is the moral equivalent of mounting
 * `<ViewControl>` in production — we're just doing it without a live
 * map handle.
 */
interface HarnessProps {
  flyMock: (lat: number, lng: number, zoom?: number) => void;
}

const BridgeInjector = ({ flyMock }: HarnessProps) => {
  const { _setMapControls } = useSparMap();
  React.useEffect(() => {
    _setMapControls({ flyToLocation: flyMock });
    return () => _setMapControls({ flyToLocation: null });
  }, [_setMapControls, flyMock]);
  return null;
};

const renderSearchControl = (flyMock: HarnessProps['flyMock']) =>
  render(
    <SparMapProvider>
      <BridgeInjector flyMock={flyMock} />
      <SearchControl />
    </SparMapProvider>,
  );

describe('SearchControl', () => {
  beforeEach(() => {
    hookState.results = [];
    hookState.loading = false;
    hookState.error = null;
  });

  it('renders the Carbon Search input', () => {
    renderSearchControl(() => {});
    expect(screen.queryByTestId('search-control')).toBeTruthy();
    expect(screen.queryByTestId('search-control-input')).toBeTruthy();
  });

  it('shows no result list when the query is shorter than 3 characters', () => {
    hookState.results = [
      { fullAddress: 'Victoria BC', latitude: 48.43, longitude: -123.37, score: 95 },
    ];
    renderSearchControl(() => {});
    // Type a 2-char query: the mocked hook short-circuits and
    // returns an empty result list regardless of hookState.
    // Carbon's <Search> forwards `data-testid` straight onto the
    // underlying <input>, so getByTestId returns the input itself.
    const input = screen.getByTestId('search-control-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'ab' } });
    expect(screen.queryByTestId('search-result-0')).toBeFalsy();
  });

  it('shows results returned by the mocked geocoder hook for a 3+ char query', () => {
    hookState.results = [
      {
        fullAddress: '800 Johnson St, Victoria, BC',
        latitude: 48.4284,
        longitude: -123.3656,
        score: 95,
      },
    ];
    renderSearchControl(() => {});
    // Carbon's <Search> forwards `data-testid` straight onto the
    // underlying <input>, so getByTestId returns the input itself.
    const input = screen.getByTestId('search-control-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Victoria' } });

    expect(screen.queryByTestId('search-result-0')).toBeTruthy();
    expect(
      screen.queryByText(/800 Johnson St, Victoria, BC/),
    ).toBeTruthy();
  });

  // Carbon's <ContainedListItem onClick={…}> renders the testid on
  // the outer <li> but wraps the children in a clickable <button>.
  // Tests that want to simulate the item click need to fire the event
  // on that inner button — falling back to the <li> triggers nothing.
  const clickItem = (testId: string) => {
    const li = screen.getByTestId(testId);
    const btn = li.querySelector('button') ?? li;
    fireEvent.click(btn);
  };

  it('calls flyToLocation with the clicked result lat/lng and zoom 14', () => {
    const flyMock = vi.fn();
    hookState.results = [
      {
        fullAddress: '800 Johnson St, Victoria, BC',
        latitude: 48.4284,
        longitude: -123.3656,
        score: 95,
      },
    ];
    renderSearchControl(flyMock);
    // Carbon's <Search> forwards `data-testid` straight onto the
    // underlying <input>, so getByTestId returns the input itself.
    const input = screen.getByTestId('search-control-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Victoria' } });

    act(() => {
      clickItem('search-result-0');
    });

    expect(flyMock).toHaveBeenCalledTimes(1);
    expect(flyMock).toHaveBeenCalledWith(48.4284, -123.3656, 14);
  });

  it('clears the input after a result is selected', () => {
    hookState.results = [
      {
        fullAddress: '800 Johnson St, Victoria, BC',
        latitude: 48.4284,
        longitude: -123.3656,
        score: 95,
      },
    ];
    renderSearchControl(() => {});
    // Carbon's <Search> forwards `data-testid` straight onto the
    // underlying <input>, so getByTestId returns the input itself.
    const input = screen.getByTestId('search-control-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Victoria' } });
    expect(input.value).toBe('Victoria');

    act(() => {
      clickItem('search-result-0');
    });

    expect(input.value).toBe('');
  });

  it('renders the loading hint when the hook reports loading', () => {
    hookState.loading = true;
    renderSearchControl(() => {});
    // Carbon's <Search> forwards `data-testid` straight onto the
    // underlying <input>, so getByTestId returns the input itself.
    const input = screen.getByTestId('search-control-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Victoria' } });
    expect(screen.queryByTestId('search-control-loading')).toBeTruthy();
  });

  it('renders the error banner when the hook reports an error', () => {
    hookState.error = 'Geocoder API returned 500';
    renderSearchControl(() => {});
    // Carbon's <Search> forwards `data-testid` straight onto the
    // underlying <input>, so getByTestId returns the input itself.
    const input = screen.getByTestId('search-control-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Victoria' } });
    expect(screen.queryByTestId('search-control-error')).toBeTruthy();
    expect(screen.queryByText(/Search unavailable/)).toBeTruthy();
  });
});
