import {
  describe, it, expect, vi, beforeEach, afterEach
} from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { useWfsGetFeature } from '../../hooks/useWfsGetFeature';

const makeWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
};

describe('useWfsGetFeature', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does NOT fetch when enabled is false', async () => {
    const { result } = renderHook(
      () => useWfsGetFeature({
        layer: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY',
        cqlFilter: '',
        enabled: false
      }),
      { wrapper: makeWrapper() }
    );

    // Give react-query a tick to settle.
    await waitFor(() => expect(result.current.isFetching).toBe(false));
    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it('fetches and returns the parsed GeoJSON when enabled', async () => {
    const mockFeatureCollection = {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
          },
          properties: { ZONE: 'IDF', SUBZONE: 'mw', VARIANT: '1' }
        }
      ]
    };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => mockFeatureCollection
    });

    const { result } = renderHook(
      () => useWfsGetFeature({
        layer: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY',
        cqlFilter: 'INTERSECTS(GEOMETRY, POINT(1200000 700000))',
        enabled: true
      }),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockFeatureCollection);

    // Verify the URL was built correctly.
    const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls).toHaveLength(1);
    const calledUrl = String(calls[0][0]);
    expect(calledUrl).toContain('openmaps.gov.bc.ca');
    expect(calledUrl).toContain('service=WFS');
    expect(calledUrl).toContain('request=GetFeature');
    expect(calledUrl).toContain('outputFormat=application%2Fjson');
    expect(calledUrl).toContain('typeNames=WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY');
    expect(calledUrl).toContain('CQL_FILTER=');
  });

  it('surfaces error state when fetch returns non-ok', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({})
    });

    const { result } = renderHook(
      () => useWfsGetFeature({
        layer: 'X',
        cqlFilter: 'INTERSECTS(GEOMETRY, POINT(0 0))',
        enabled: true
      }),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
