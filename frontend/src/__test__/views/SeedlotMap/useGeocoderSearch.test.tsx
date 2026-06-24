import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { useGeocoderSearch } from '../../../views/Seedlot/SeedlotMap/SearchControl/useGeocoderSearch';

/**
 * Covers the debounce + fetch integration of the useGeocoderSearch
 * hook. The SearchControl test mocks this hook out entirely, so this
 * file is the direct test coverage for the hook itself.
 *
 * Uses real timers and `waitFor` instead of fake timers — fake timers
 * interact poorly with awaited microtasks inside the hook effect
 * (the `await searchLocation` inside the setTimeout callback never
 * resolves under vi.useFakeTimers() without extra plumbing), so we
 * simply let the 300 ms debounce elapse for real. Each test runs in
 * ~400 ms which is acceptable for a handful of cases.
 */

const sampleResponse = () => ({
  ok: true,
  json: async () => ({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-123.37, 48.43] },
        properties: { fullAddress: 'Test BC', score: 90 },
      },
    ],
  }),
});

interface ConsumerProps {
  query: string;
}

const Consumer = ({ query }: ConsumerProps) => {
  const { results, loading, error } = useGeocoderSearch(query);
  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'idle'}</span>
      <span data-testid="error">{error ?? 'none'}</span>
      <span data-testid="count">{results.length}</span>
      {results.map((r, i) => (
        <span key={i} data-testid={`hit-${i}`}>
          {r.fullAddress}
        </span>
      ))}
    </div>
  );
};

describe('useGeocoderSearch', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not call fetch for queries shorter than 3 characters', async () => {
    render(<Consumer query="ab" />);
    // Wait longer than the 300 ms debounce to be sure nothing fires.
    await new Promise((resolve) => setTimeout(resolve, 350));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('exposes the mapped results on success after the debounce window', async () => {
    fetchMock.mockResolvedValue(sampleResponse());
    render(<Consumer query="Victoria" />);
    await waitFor(
      () => {
        expect(screen.getByTestId('count').textContent).toBe('1');
      },
      { timeout: 2000 },
    );
    expect(screen.getByTestId('hit-0').textContent).toBe('Test BC');
    expect(screen.getByTestId('error').textContent).toBe('none');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('surfaces an error message when fetch rejects', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));
    render(<Consumer query="Victoria" />);
    await waitFor(
      () => {
        expect(screen.getByTestId('error').textContent).toBe('network down');
      },
      { timeout: 2000 },
    );
    expect(screen.getByTestId('count').textContent).toBe('0');
  });
});
