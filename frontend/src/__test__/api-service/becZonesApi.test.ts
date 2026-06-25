import {
  describe, it, expect, vi, beforeEach, afterEach
} from 'vitest';
import type { Feature, MultiPolygon } from 'geojson';

import {
  fetchBecZonesIntersecting,
  fetchBecZoneByMapLabel,
  buildBecZoneByMapLabelUrl,
  becVariantFromFeatureCollection,
  OPENMAPS_WFS_URL,
  BEC_QUERY_LAYER
} from '../../api-service/becZonesApi';

/**
 * A square AOI near Victoria in WGS84. The function under test must
 * reproject this to BC Albers before embedding it in the CQL filter, so
 * the tests only care that the resulting URL contains the reprojected
 * coordinates rather than the raw lng/lat values.
 */
const victoriaSquare: Feature<MultiPolygon> = {
  type: 'Feature',
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [[
        [-123.38, 48.42],
        [-123.36, 48.42],
        [-123.36, 48.44],
        [-123.38, 48.44],
        [-123.38, 48.42]
      ]]
    ]
  },
  properties: {}
};

const mockResponse = (body: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    json: () => Promise.resolve(body)
  }) as Response;

describe('fetchBecZonesIntersecting', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls the openmaps WFS endpoint with WFS 2.0 GetFeature params', async () => {
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(mockResponse({ type: 'FeatureCollection', features: [] }));

    await fetchBecZonesIntersecting(victoriaSquare);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const calledUrl = String(fetchSpy.mock.calls[0][0]);
    expect(calledUrl).toContain(OPENMAPS_WFS_URL);
    expect(calledUrl).toContain('service=WFS');
    expect(calledUrl).toContain('version=2.0.0');
    expect(calledUrl).toContain('request=GetFeature');
    expect(calledUrl).toContain(`typeNames=${encodeURIComponent(BEC_QUERY_LAYER)}`);
    expect(calledUrl).toContain('outputFormat=application%2Fjson');
  });

  it('embeds a CQL INTERSECTS filter with BC Albers coordinates', async () => {
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(mockResponse({ type: 'FeatureCollection', features: [] }));

    await fetchBecZonesIntersecting(victoriaSquare);

    const url = new URL(String(fetchSpy.mock.calls[0][0]));
    const cql = url.searchParams.get('CQL_FILTER');
    expect(cql).toBeTruthy();
    expect(cql).toContain('INTERSECTS(GEOMETRY,MULTIPOLYGON');
    // proj4 maps (-123.37, 48.43) to roughly 1193000, 383000 in BC Albers;
    // assert the easting/northing order of magnitude appears in the WKT
    // to prove the reprojection ran rather than the raw lng/lat leaking
    // through.
    expect(cql).toMatch(/INTERSECTS\(GEOMETRY,MULTIPOLYGON\(\(\(119\d{4}\.?\d* 38\d{4}/);
  });

  it('requests only the ZONE property to minimize payload', async () => {
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(mockResponse({ type: 'FeatureCollection', features: [] }));

    await fetchBecZonesIntersecting(victoriaSquare);

    const calledUrl = String(fetchSpy.mock.calls[0][0]);
    expect(calledUrl).toContain('propertyName=ZONE');
  });

  it('extracts distinct ZONE codes from the feature collection', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse({
        type: 'FeatureCollection',
        features: [
          { type: 'Feature', properties: { ZONE: 'CDF' }, geometry: null },
          { type: 'Feature', properties: { ZONE: 'CWH' }, geometry: null },
          { type: 'Feature', properties: { ZONE: 'CDF' }, geometry: null },
          { type: 'Feature', properties: { ZONE: 'MH' }, geometry: null }
        ]
      })
    );

    const zones = await fetchBecZonesIntersecting(victoriaSquare);

    expect(zones).toEqual(['CDF', 'CWH', 'MH']);
  });

  it('uses the containing BEC zone when broad polygon intersection includes touching neighbours', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        mockResponse({
          type: 'FeatureCollection',
          features: [
            { type: 'Feature', properties: { ZONE: 'MH' }, geometry: null },
            { type: 'Feature', properties: { ZONE: 'CWH' }, geometry: null },
            { type: 'Feature', properties: { ZONE: 'CMA' }, geometry: null }
          ]
        })
      )
      .mockResolvedValueOnce(
        mockResponse({
          type: 'FeatureCollection',
          features: [
            { type: 'Feature', properties: { ZONE: 'CWH' }, geometry: null }
          ]
        })
      );

    const zones = await fetchBecZonesIntersecting(victoriaSquare);

    expect(zones).toEqual(['CWH']);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(
      new URL(String(fetchSpy.mock.calls[1][0])).searchParams.get('CQL_FILTER')
    ).toContain('CONTAINS(GEOMETRY,MULTIPOLYGON');
  });

  it('uses interior sample points when no single BEC feature contains the AOI', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        mockResponse({
          type: 'FeatureCollection',
          features: [
            { type: 'Feature', properties: { ZONE: 'MH' }, geometry: null },
            { type: 'Feature', properties: { ZONE: 'CWH' }, geometry: null },
            { type: 'Feature', properties: { ZONE: 'CMA' }, geometry: null }
          ]
        })
      )
      .mockResolvedValueOnce(
        mockResponse({ type: 'FeatureCollection', features: [] })
      )
      .mockResolvedValueOnce(
        mockResponse({
          type: 'FeatureCollection',
          features: [
            { type: 'Feature', properties: { ZONE: 'CWH' }, geometry: null }
          ]
        })
      );

    const zones = await fetchBecZonesIntersecting(victoriaSquare);

    expect(zones).toEqual(['CWH']);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(
      new URL(String(fetchSpy.mock.calls[2][0])).searchParams.get('CQL_FILTER')
    ).toContain('INTERSECTS(GEOMETRY,MULTIPOINT');
  });

  it('returns an empty array for an empty feature collection', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse({ type: 'FeatureCollection', features: [] })
    );

    const zones = await fetchBecZonesIntersecting(victoriaSquare);

    expect(zones).toEqual([]);
  });

  it('skips features with missing or non-string ZONE properties', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse({
        type: 'FeatureCollection',
        features: [
          { type: 'Feature', properties: { ZONE: 'IDF' }, geometry: null },
          { type: 'Feature', properties: {}, geometry: null },
          { type: 'Feature', properties: { ZONE: null }, geometry: null },
          { type: 'Feature', properties: { ZONE: 42 }, geometry: null }
        ]
      })
    );

    const zones = await fetchBecZonesIntersecting(victoriaSquare);

    expect(zones).toEqual(['IDF']);
  });

  it('throws when the HTTP call fails so callers can decide fail-open vs fail-closed', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse({}, false, 503)
    );

    await expect(fetchBecZonesIntersecting(victoriaSquare)).rejects.toThrow(
      /WFS GetFeature failed: 503/
    );
  });

  it('handles a single-polygon MultiPolygon without throwing', async () => {
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(mockResponse({ type: 'FeatureCollection', features: [] }));

    const singlePoly: Feature<MultiPolygon> = {
      type: 'Feature',
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [[
            [-123.38, 48.42],
            [-123.36, 48.42],
            [-123.36, 48.44],
            [-123.38, 48.42]
          ]]
        ]
      },
      properties: {}
    };

    await expect(fetchBecZonesIntersecting(singlePoly)).resolves.toBeDefined();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('handles a multi-ring polygon (polygon with a hole)', async () => {
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(mockResponse({ type: 'FeatureCollection', features: [] }));

    const ringed: Feature<MultiPolygon> = {
      type: 'Feature',
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [-123.40, 48.40], [-123.30, 48.40], [-123.30, 48.50],
              [-123.40, 48.50], [-123.40, 48.40]
            ],
            [
              [-123.38, 48.42], [-123.32, 48.42], [-123.32, 48.48],
              [-123.38, 48.48], [-123.38, 48.42]
            ]
          ]
        ]
      },
      properties: {}
    };

    await expect(fetchBecZonesIntersecting(ringed)).resolves.toBeDefined();
    const url = new URL(String(fetchSpy.mock.calls[0][0]));
    const cql = url.searchParams.get('CQL_FILTER') ?? '';
    // Both outer ring and inner hole should appear in the WKT
    expect(cql).toContain('MULTIPOLYGON(((');
    // Two rings → one ring separator ")," between them (whitespace
    // tolerant so either "),( " or "), (" matches)
    expect(cql).toMatch(/\), ?\(/);
  });
});

describe('fetchBecZoneByMapLabel', () => {
  beforeEach(() => { vi.restoreAllMocks(); });
  afterEach(() => { vi.restoreAllMocks(); });

  it('builds a WFS GetFeature URL with CQL_FILTER MAP_LABEL=\'IDFmw1\' against the pub: BEC layer', () => {
    const url = new URL(buildBecZoneByMapLabelUrl('IDFmw1'));
    expect(url.origin + url.pathname).toBe(OPENMAPS_WFS_URL);
    expect(url.searchParams.get('service')).toBe('WFS');
    expect(url.searchParams.get('request')).toBe('GetFeature');
    expect(url.searchParams.get('typeNames')).toBe(`pub:${BEC_QUERY_LAYER}`);
    expect(url.searchParams.get('outputFormat')).toBe('application/json');
    expect(url.searchParams.get('CQL_FILTER')).toBe("MAP_LABEL='IDFmw1'");
  });

  it('escapes embedded single quotes in the MAP_LABEL (CQL injection guard)', () => {
    // Carries the SQL-style standard for escaping single quotes — doubling.
    const url = new URL(buildBecZoneByMapLabelUrl("O'Test"));
    expect(url.searchParams.get('CQL_FILTER')).toBe("MAP_LABEL='O''Test'");
  });

  it('returns null when the input MAP_LABEL is empty (defensive)', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    expect(await fetchBecZoneByMapLabel('')).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns the feature when WFS responds with one matching Polygon', async () => {
    const feature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[-123, 49], [-122, 49], [-122, 50], [-123, 50], [-123, 49]]],
      },
      properties: { MAP_LABEL: 'IDFmw1', ZONE: 'IDF', SUBZONE: 'mw', VARIANT: '1' },
    };
    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse({ type: 'FeatureCollection', features: [feature] })
    );
    const result = await fetchBecZoneByMapLabel('IDFmw1');
    expect(result?.properties.MAP_LABEL).toBe('IDFmw1');
    expect(result?.geometry.type).toBe('Polygon');
  });

  it('returns the feature when WFS responds with one matching MultiPolygon', async () => {
    const feature = {
      type: 'Feature',
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [[[-123, 49], [-122, 49], [-122, 50], [-123, 50], [-123, 49]]],
        ],
      },
      properties: { MAP_LABEL: 'CWHvm1' },
    };
    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse({ type: 'FeatureCollection', features: [feature] })
    );
    const result = await fetchBecZoneByMapLabel('CWHvm1');
    expect(result?.geometry.type).toBe('MultiPolygon');
  });

  it('returns null when WFS returns no matching feature', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse({ type: 'FeatureCollection', features: [] })
    );
    expect(await fetchBecZoneByMapLabel('NOPE')).toBeNull();
  });

  it('returns null on non-2xx (fail-open so the panel stays interactive)', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse({}, false, 503));
    expect(await fetchBecZoneByMapLabel('IDFmw1')).toBeNull();
  });
});

describe('becVariantFromFeatureCollection', () => {
  it('maps MAP_LABEL + zone/subzone/variant from the first feature', () => {
    const v = becVariantFromFeatureCollection({
      features: [{ properties: { MAP_LABEL: 'IDFmw1', ZONE: 'IDF', SUBZONE: 'mw', VARIANT: '1' } }]
    });
    expect(v).toEqual({ mapLabel: 'IDFmw1', zone: 'IDF', subzone: 'mw', variant: '1' });
  });

  it('falls back to ZONE when MAP_LABEL absent', () => {
    expect(becVariantFromFeatureCollection({ features: [{ properties: { ZONE: 'CWH' } }] }))
      .toEqual({ mapLabel: 'CWH', zone: 'CWH', subzone: null, variant: null });
  });

  it('returns null when no usable feature', () => {
    expect(becVariantFromFeatureCollection({ features: [] })).toBeNull();
    expect(becVariantFromFeatureCollection({ features: [{ properties: {} }] })).toBeNull();
  });
});
