import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  OPENMAPS_WFS_URL,
  SEEDLOT_POINT_LAYER,
  VEGLOT_POINT_LAYER,
  buildSeedlotPointsWfsUrl,
  fetchSeedlotPoints,
} from '../../api-service/seedlotPointsApi';

const realFetch = global.fetch;

beforeEach(() => {
  global.fetch = vi.fn() as unknown as typeof fetch;
});

afterEach(() => {
  global.fetch = realFetch;
});

const sampleBounds = {
  south: 49.0,
  west: -123.5,
  north: 50.0,
  east: -122.5,
};

describe('buildSeedlotPointsWfsUrl', () => {
  it('targets the openmaps WFS endpoint with bbox encoded into CQL_FILTER', () => {
    const url = buildSeedlotPointsWfsUrl(SEEDLOT_POINT_LAYER, sampleBounds);
    expect(url.startsWith(OPENMAPS_WFS_URL)).toBe(true);
    const parsed = new URL(url);
    expect(parsed.searchParams.get('service')).toBe('WFS');
    expect(parsed.searchParams.get('version')).toBe('2.0.0');
    expect(parsed.searchParams.get('request')).toBe('GetFeature');
    expect(parsed.searchParams.get('typeNames')).toBe(SEEDLOT_POINT_LAYER);
    expect(parsed.searchParams.get('outputFormat')).toBe('application/json');
    expect(parsed.searchParams.get('srsName')).toBe('EPSG:4326');
    // bbox lives inside CQL_FILTER as (west, south, east, north) — WFS
    // 2.0 rejects bbox+cql_filter as separate params, and GeoServer CQL
    // BBOX wants minX/minY/maxX/maxY regardless of EPSG axis order.
    expect(parsed.searchParams.get('CQL_FILTER')).toBe(
      "BBOX(GEOMETRY,-123.5,49,-122.5,50,'EPSG:4326')"
    );
  });

  it('uses only the BBOX predicate when activeOnly is null', () => {
    const url = buildSeedlotPointsWfsUrl(SEEDLOT_POINT_LAYER, sampleBounds, null);
    const cql = new URL(url).searchParams.get('CQL_FILTER') ?? '';
    expect(cql).toContain('BBOX(GEOMETRY');
    expect(cql).not.toContain('ACTIVE_IND');
  });

  it("ANDs the bbox with ACTIVE_IND='YES' for active-only fetches", () => {
    const url = buildSeedlotPointsWfsUrl(SEEDLOT_POINT_LAYER, sampleBounds, 'YES');
    expect(new URL(url).searchParams.get('CQL_FILTER')).toBe(
      "BBOX(GEOMETRY,-123.5,49,-122.5,50,'EPSG:4326') AND ACTIVE_IND='YES'"
    );
  });

  it("ANDs the bbox with ACTIVE_IND='NO' for expired-only fetches", () => {
    const url = buildSeedlotPointsWfsUrl(VEGLOT_POINT_LAYER, sampleBounds, 'NO');
    expect(new URL(url).searchParams.get('CQL_FILTER')).toBe(
      "BBOX(GEOMETRY,-123.5,49,-122.5,50,'EPSG:4326') AND ACTIVE_IND='NO'"
    );
  });

  it('appends a VEGETATION_CODE filter when speciesCode is supplied', () => {
    const url = buildSeedlotPointsWfsUrl(SEEDLOT_POINT_LAYER, sampleBounds, 'YES', 'FDC');
    expect(new URL(url).searchParams.get('CQL_FILTER')).toBe(
      "BBOX(GEOMETRY,-123.5,49,-122.5,50,'EPSG:4326') AND ACTIVE_IND='YES' AND VEGETATION_CODE='FDC'"
    );
  });

  it('uppercases and escapes single quotes in speciesCode', () => {
    const url = buildSeedlotPointsWfsUrl(SEEDLOT_POINT_LAYER, sampleBounds, null, "o'fdc");
    expect(new URL(url).searchParams.get('CQL_FILTER')).toContain(
      "VEGETATION_CODE='O''FDC'"
    );
  });

  it('ignores empty / whitespace-only speciesCode', () => {
    const url = buildSeedlotPointsWfsUrl(SEEDLOT_POINT_LAYER, sampleBounds, null, '   ');
    expect(new URL(url).searchParams.get('CQL_FILTER')).not.toContain('VEGETATION_CODE');
  });
});

describe('fetchSeedlotPoints', () => {
  it('parses seedlot features into flat SeedlotPoint records', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              SEEDLOT_NUMBER: '12345',
              VEGETATION_CODE: 'FDI',
              BEC_ZONE: 'IDF / xh / 1',
              ACTIVE_IND: 'YES',
            },
            geometry: { type: 'Point', coordinates: [-120.5, 50.3] },
          },
        ],
      }),
    });

    const result = await fetchSeedlotPoints(SEEDLOT_POINT_LAYER, sampleBounds, 'YES');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      lotNumber: '12345',
      vegetationCode: 'FDI',
      bcgZone: 'IDF / xh / 1',
      activeIndicator: 'YES',
      lat: 50.3,
      lng: -120.5,
    });
  });

  it('falls back to VEG_LOT_ID for veglot features', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { VEG_LOT_ID: '67890', VEGETATION_CODE: 'YC', ACTIVE_IND: 'NO' },
            geometry: { type: 'Point', coordinates: [-128.5, 53.1] },
          },
        ],
      }),
    });

    const result = await fetchSeedlotPoints(VEGLOT_POINT_LAYER, sampleBounds);
    expect(result[0].lotNumber).toBe('67890');
    expect(result[0].activeIndicator).toBe('NO');
  });

  it('skips features with malformed coordinates', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { SEEDLOT_NUMBER: '1', VEGETATION_CODE: 'FDC' },
            geometry: { type: 'Point', coordinates: [] },
          },
          {
            type: 'Feature',
            properties: { SEEDLOT_NUMBER: '2', VEGETATION_CODE: 'FDC' },
            geometry: { type: 'Point', coordinates: [-123, 49] },
          },
        ],
      }),
    });

    const result = await fetchSeedlotPoints(SEEDLOT_POINT_LAYER, sampleBounds);
    expect(result).toHaveLength(1);
    expect(result[0].lotNumber).toBe('2');
  });

  it('fails open with an empty array on a 5xx response', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, status: 502 });
    const result = await fetchSeedlotPoints(SEEDLOT_POINT_LAYER, sampleBounds);
    expect(result).toEqual([]);
  });
});
