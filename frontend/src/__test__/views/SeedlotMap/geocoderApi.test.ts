import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  searchLocation,
  BC_GEOCODER_URL,
} from '../../../api-service/geocoderApi';

/**
 * Unit tests for the BC Gov geocoder wrapper. Mocks `global.fetch` so
 * the tests never hit the live API — CORS + network behavior is
 * verified manually against the real endpoint.
 *
 * The wrapper has three behaviors worth asserting:
 *   1. Empty / short queries short-circuit and return [] WITHOUT
 *      calling fetch (saves a round-trip, matches the hook contract).
 *   2. A real query hits the right URL with the right params, and the
 *      GeoJSON FeatureCollection is mapped into flat GeocoderResult
 *      objects with lat/lng pulled out of the coordinates tuple.
 *   3. Non-2xx responses throw an Error that the hook can surface.
 */

const sampleFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        // GeoJSON is [lng, lat] — deliberately not a round number to
        // catch any accidental lat/lng swap in the mapper.
        coordinates: [-123.3656, 48.4284],
      },
      properties: {
        fullAddress: '800 Johnson St, Victoria, BC',
        score: 95,
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-123.1207, 49.2827],
      },
      properties: {
        fullAddress: 'Vancouver, BC',
        score: 78,
      },
    },
  ],
};

describe('searchLocation', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns an empty array and skips fetch for an empty query', async () => {
    const results = await searchLocation('');
    expect(results).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns an empty array and skips fetch for a query shorter than 3 chars', async () => {
    const results = await searchLocation('ab');
    expect(results).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('calls the BC Gov geocoder URL with the expected query params', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => sampleFeatureCollection,
    });

    await searchLocation('Victoria BC');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl.startsWith(BC_GEOCODER_URL)).toBe(true);
    expect(calledUrl).toContain('addressString=Victoria+BC');
    expect(calledUrl).toContain('maxResults=5');
    expect(calledUrl).toContain('outputSRS=4326');
    expect(calledUrl).toContain('echo=true');
    expect(calledUrl).toContain('brief=true');
  });

  it('maps the GeoJSON FeatureCollection into flat GeocoderResult objects', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => sampleFeatureCollection,
    });

    const results = await searchLocation('Victoria BC');

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      fullAddress: '800 Johnson St, Victoria, BC',
      // lat/lng should be flipped out of the [lng, lat] tuple
      latitude: 48.4284,
      longitude: -123.3656,
      score: 95,
    });
    expect(results[1].fullAddress).toBe('Vancouver, BC');
    expect(results[1].score).toBe(78);
  });

  it('respects a custom maxResults parameter', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ type: 'FeatureCollection', features: [] }),
    });

    await searchLocation('Kelowna', 10);

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain('maxResults=10');
  });

  it('throws when the fetch response is not ok', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(searchLocation('Victoria BC')).rejects.toThrow(
      /Geocoder API returned 500/,
    );
  });

  it('filters out features without a Point geometry', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: null,
            properties: { fullAddress: 'broken', score: 0 },
          },
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [-123.0, 49.0],
            },
            properties: { fullAddress: 'Good match', score: 50 },
          },
        ],
      }),
    });

    const results = await searchLocation('Test');
    expect(results).toHaveLength(1);
    expect(results[0].fullAddress).toBe('Good match');
  });

  it('falls back to sensible defaults when properties are missing', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-123.0, 49.0] },
            properties: {},
          },
        ],
      }),
    });

    const results = await searchLocation('Test');
    expect(results).toHaveLength(1);
    expect(results[0].fullAddress).toBe('Unknown');
    expect(results[0].score).toBe(0);
  });
});
