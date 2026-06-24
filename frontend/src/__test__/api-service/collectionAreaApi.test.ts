import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  OPENMAPS_WFS_URL,
  SEEDLOT_COLLECTION_LAYER,
  buildCollectionAreaWfsUrl,
  fetchCollectionAreaBySeedlotNumber
} from '../../api-service/collectionAreaApi';

const realFetch = global.fetch;

beforeEach(() => {
  global.fetch = vi.fn() as unknown as typeof fetch;
});

afterEach(() => {
  global.fetch = realFetch;
});

describe('buildCollectionAreaWfsUrl', () => {
  it('targets the DataBC openmaps WFS endpoint with the seedlot CQL filter', () => {
    const url = buildCollectionAreaWfsUrl('12345');
    expect(url.startsWith(OPENMAPS_WFS_URL)).toBe(true);
    const parsed = new URL(url);
    expect(parsed.searchParams.get('service')).toBe('WFS');
    expect(parsed.searchParams.get('version')).toBe('2.0.0');
    expect(parsed.searchParams.get('request')).toBe('GetFeature');
    expect(parsed.searchParams.get('typeNames')).toBe(SEEDLOT_COLLECTION_LAYER);
    expect(parsed.searchParams.get('outputFormat')).toBe('application/json');
    expect(parsed.searchParams.get('CQL_FILTER')).toBe(
      "SEEDLOT_NUMBER='12345'"
    );
  });

  it('escapes single quotes in the seedlot number (defensive)', () => {
    const url = buildCollectionAreaWfsUrl("O'Hara");
    const parsed = new URL(url);
    expect(parsed.searchParams.get('CQL_FILTER')).toBe(
      "SEEDLOT_NUMBER='O''Hara'"
    );
  });
});

describe('fetchCollectionAreaBySeedlotNumber', () => {
  it('returns an empty array for blank seedlot numbers', async () => {
    const result = await fetchCollectionAreaBySeedlotNumber('');
    expect(result).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('parses a Polygon feature into a single AoiPolygon', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { SEEDLOT_NUMBER: '12345' },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [-123, 49],
                  [-122, 49],
                  [-122, 50],
                  [-123, 50],
                  [-123, 49]
                ]
              ]
            }
          }
        ]
      })
    });

    const result = await fetchCollectionAreaBySeedlotNumber('12345');
    expect(result).toHaveLength(1);
    expect(result[0].geometry.type).toBe('Polygon');
  });

  it('splits a MultiPolygon feature into one AoiPolygon per part', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { SEEDLOT_NUMBER: '12345' },
            geometry: {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [-123, 49],
                    [-122, 49],
                    [-122, 50],
                    [-123, 50],
                    [-123, 49]
                  ]
                ],
                [
                  [
                    [-121, 49],
                    [-120, 49],
                    [-120, 50],
                    [-121, 50],
                    [-121, 49]
                  ]
                ]
              ]
            }
          }
        ]
      })
    });

    const result = await fetchCollectionAreaBySeedlotNumber('12345');
    expect(result).toHaveLength(2);
    expect(result[0].geometry.type).toBe('Polygon');
    expect(result[1].geometry.type).toBe('Polygon');
  });

  it('fails open with an empty array on a 4xx/5xx response', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500
    });
    const result = await fetchCollectionAreaBySeedlotNumber('12345');
    expect(result).toEqual([]);
  });

  it('returns an empty array when there are no matching features', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ type: 'FeatureCollection', features: [] })
    });
    const result = await fetchCollectionAreaBySeedlotNumber('12345');
    expect(result).toEqual([]);
  });
});
