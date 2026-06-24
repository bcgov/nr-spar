import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Feature, Polygon } from 'geojson';

import {
  CONTOUR_LINES_LAYER,
  OPENMAPS_WFS_URL,
  SPOT_ELEVATION_LAYER,
  buildElevationWfsUrl,
  fetchPolygonElevationRange,
  polygonFeatureToBcAlbersWkt,
} from '../../api-service/elevationApi';

const realFetch = global.fetch;

beforeEach(() => {
  global.fetch = vi.fn() as unknown as typeof fetch;
});

afterEach(() => {
  global.fetch = realFetch;
});

const samplePolygon: Feature<Polygon> = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [-123, 49],
        [-122, 49],
        [-122, 50],
        [-123, 50],
        [-123, 49],
      ],
    ],
  },
};

describe('polygonFeatureToBcAlbersWkt', () => {
  it('emits a POLYGON((…)) WKT in BC Albers (EPSG:3005) coordinates', () => {
    const wkt = polygonFeatureToBcAlbersWkt(samplePolygon);
    expect(wkt.startsWith('POLYGON((')).toBe(true);
    expect(wkt.endsWith('))')).toBe(true);
    // BC Albers easting/northing for BC are 7-digit metres; the values
    // for a polygon around (-123, 49) should be roughly 1,150,000 E and
    // 380,000 N. We assert the first vertex magnitude rather than the
    // exact number to keep the test robust to proj4 build precision.
    const firstCoord = wkt.replace(/POLYGON\(\(/, '').split(',')[0].trim();
    const [easting, northing] = firstCoord.split(' ').map(Number);
    expect(easting).toBeGreaterThan(1000000);
    expect(easting).toBeLessThan(1400000);
    expect(northing).toBeGreaterThan(300000);
    expect(northing).toBeLessThan(500000);
  });
});

describe('buildElevationWfsUrl', () => {
  it('targets the openmaps WFS endpoint with an INTERSECTS CQL filter', () => {
    const url = buildElevationWfsUrl(CONTOUR_LINES_LAYER, 'POLYGON((0 0, 1 0, 1 1, 0 0))');
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe(OPENMAPS_WFS_URL);
    expect(parsed.searchParams.get('typeNames')).toBe(CONTOUR_LINES_LAYER);
    expect(parsed.searchParams.get('outputFormat')).toBe('application/json');
    expect(parsed.searchParams.get('propertyName')).toBe('ELEVATION');
    expect(parsed.searchParams.get('CQL_FILTER')).toBe(
      'INTERSECTS(GEOMETRY,POLYGON((0 0, 1 0, 1 1, 0 0)))'
    );
  });
});

describe('fetchPolygonElevationRange', () => {
  it('returns the min/max from contour line features when present', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: 'FeatureCollection',
        features: [
          { properties: { ELEVATION: 1200 } },
          { properties: { ELEVATION: 800 } },
          { properties: { ELEVATION: 1500 } },
        ],
      }),
    });

    const result = await fetchPolygonElevationRange(samplePolygon);
    expect(result).toEqual({
      minM: 800,
      maxM: 1500,
      source: 'contours',
      sampleCount: 3,
    });
    // Only ONE fetch — fell through on the contour hit, no fallback.
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('falls back to spot elevation points when no contours intersect', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ type: 'FeatureCollection', features: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          type: 'FeatureCollection',
          features: [
            { properties: { ELEVATION: 350 } },
            { properties: { ELEVATION: 410 } },
          ],
        }),
      });

    const result = await fetchPolygonElevationRange(samplePolygon);
    expect(result).toEqual({
      minM: 350,
      maxM: 410,
      source: 'spot-points',
      sampleCount: 2,
    });
    expect(global.fetch).toHaveBeenCalledTimes(2);
    const firstCall = decodeURIComponent(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    );
    const secondCall = decodeURIComponent(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[1][0] as string
    );
    expect(firstCall).toContain(CONTOUR_LINES_LAYER);
    expect(secondCall).toContain(SPOT_ELEVATION_LAYER);
  });

  it('returns null when neither source has features in the AOI', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValue({
        ok: true,
        json: async () => ({ type: 'FeatureCollection', features: [] }),
      });

    const result = await fetchPolygonElevationRange(samplePolygon);
    expect(result).toBeNull();
  });

  it('treats a non-2xx response from the contour layer as no-data (then tries spot fallback)', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          type: 'FeatureCollection',
          features: [{ properties: { ELEVATION: 900 } }],
        }),
      });

    const result = await fetchPolygonElevationRange(samplePolygon);
    expect(result?.source).toBe('spot-points');
    expect(result?.minM).toBe(900);
  });

  it('ignores feature entries without a numeric ELEVATION', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: 'FeatureCollection',
        features: [
          { properties: { ELEVATION: 1000 } },
          { properties: { ELEVATION: null } },
          { properties: {} },
          { properties: { ELEVATION: 'not-a-number' } },
          { properties: { ELEVATION: 1500 } },
        ],
      }),
    });

    const result = await fetchPolygonElevationRange(samplePolygon);
    expect(result?.minM).toBe(1000);
    expect(result?.maxM).toBe(1500);
    expect(result?.sampleCount).toBe(2);
  });
});
