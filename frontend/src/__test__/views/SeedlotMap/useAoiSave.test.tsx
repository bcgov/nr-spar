import React from 'react';
import {
  describe, it, expect, vi, beforeEach, afterEach
} from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { Feature, MultiPolygon } from 'geojson';

import { useAoiSave } from '../../../views/Seedlot/SeedlotMap/AoiToolbar/useAoiSave';
import * as sparMapApi from '../../../api-service/sparMapApi';
import * as becZonesApi from '../../../api-service/becZonesApi';

/**
 * Factory for a QueryClientProvider wrapper with retries disabled so the
 * mutation errors surface immediately (no exponential backoff delays in
 * the test run).
 */
const createWrapper = () => {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
};

const sampleMultiPolygon: Feature<MultiPolygon> = {
  type: 'Feature',
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
    ]
  },
  properties: {}
};

describe('useAoiSave', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('derives a single BEC zone then calls sparMapApi.saveAoi with the zone in the payload', async () => {
    const becSpy = vi
      .spyOn(becZonesApi, 'fetchBecZonesIntersecting')
      .mockResolvedValue(['CDF']);
    const saveSpy = vi
      .spyOn(sparMapApi, 'saveAoi')
      .mockResolvedValue({ ok: true, savedAt: '2026-04-07T00:00:00Z', becZones: ['CDF'] });

    const { result } = renderHook(() => useAoiSave('12345'), {
      wrapper: createWrapper()
    });

    result.current.mutate(sampleMultiPolygon);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(becSpy).toHaveBeenCalledWith(sampleMultiPolygon);
    expect(saveSpy).toHaveBeenCalledWith({
      seedlotNumber: '12345',
      polygon: sampleMultiPolygon,
      becZones: ['CDF']
    });
  });

  it('blocks saving when the AOI crosses more than one BEC zone', async () => {
    const becSpy = vi
      .spyOn(becZonesApi, 'fetchBecZonesIntersecting')
      .mockResolvedValue(['CDF', 'CWH']);
    const saveSpy = vi
      .spyOn(sparMapApi, 'saveAoi')
      .mockResolvedValue({ ok: true, savedAt: '2026-04-07T00:00:00Z', becZones: [] });

    const { result } = renderHook(() => useAoiSave('12345'), {
      wrapper: createWrapper()
    });

    result.current.mutate(sampleMultiPolygon);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(becSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).not.toHaveBeenCalled();
    expect(String(result.current.error)).toContain(
      'You have drawn an invalid polygon. Geometry crosses more than one BEC Zone: CDF CWH'
    );
  });

  it('fails closed when BEC derivation errors out', async () => {
    const becSpy = vi
      .spyOn(becZonesApi, 'fetchBecZonesIntersecting')
      .mockRejectedValue(new Error('WFS GetFeature failed: 503'));
    const saveSpy = vi
      .spyOn(sparMapApi, 'saveAoi')
      .mockResolvedValue({ ok: true, savedAt: '2026-04-07T00:00:00Z', becZones: [] });

    const { result } = renderHook(() => useAoiSave('12345'), {
      wrapper: createWrapper()
    });

    result.current.mutate(sampleMultiPolygon);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(becSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).not.toHaveBeenCalled();
    expect(String(result.current.error)).toContain('Unable to validate BEC Zone');
  });

  it('exposes error state when the save API call rejects', async () => {
    vi.spyOn(becZonesApi, 'fetchBecZonesIntersecting').mockResolvedValue([]);
    vi.spyOn(sparMapApi, 'saveAoi').mockRejectedValue(new Error('Network down'));

    const { result } = renderHook(() => useAoiSave('12345'), {
      wrapper: createWrapper()
    });

    result.current.mutate(sampleMultiPolygon);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(String(result.current.error)).toContain('Network down');
  });
});
