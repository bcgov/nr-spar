import {
  afterEach, beforeEach, describe, expect, it, vi
} from 'vitest';

import { buildLegendJsonUrl } from '../../api-service/legendApi';
import { buildOpenmapsUrl, getOpenmapsJson, isOpenmapsAbort } from '../../api-service/openmapsClient';
import { buildSeedlotPointsWfsUrl } from '../../api-service/seedlotPointsApi';

const wfsParams = () => new URLSearchParams({
  service: 'WFS',
  request: 'GetFeature',
  typeNames: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY',
  outputFormat: 'application/json'
});

describe('OpenMaps browser-direct URLs', () => {
  it('sends WFS queries to the OpenMaps WFS endpoint', () => {
    const url = buildSeedlotPointsWfsUrl(
      'pub:WHSE_FOREST_VEGETATION.SEED_SEEDLOT_POINT_MVW',
      {
        south: 54.1,
        west: -126.6,
        north: 54.2,
        east: -126.3
      },
      'YES'
    );

    expect(url).toContain('https://openmaps.gov.bc.ca/geo/pub/wfs?');
    expect(url).toContain('service=WFS');
    expect(url).toContain('request=GetFeature');
    expect(url).toContain('ACTIVE_IND');
  });

  it('sends legend queries to the OpenMaps WMS endpoint', () => {
    const url = buildLegendJsonUrl({
      url: 'https://openmaps.gov.bc.ca/geo/pub/wms',
      layers: 'pub:WHSE_FOREST_VEGETATION.SEED_PLAN_ZONE_POLY_MVW',
      styles: '4459'
    }, '959229.3,1010027.0,975584.7,1022905.8');

    expect(url).toContain('https://openmaps.gov.bc.ca/geo/pub/wms?');
    expect(url).toContain('request=GetLegendGraphic');
    expect(url).toContain('format=application%2Fjson');
    expect(url).toContain('style=4459');
  });

  it('routes by service', () => {
    expect(buildOpenmapsUrl(wfsParams())).toMatch(/\/geo\/pub\/wfs\?/);
  });
});

describe('getOpenmapsJson', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response('{"features":[]}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('POSTs WFS form-encoded, without auth, and defaults the feature cap', async () => {
    const params = wfsParams();

    await expect(getOpenmapsJson(params)).resolves.toEqual({ features: [] });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://openmaps.gov.bc.ca/geo/pub/wfs');
    expect(init.method).toBe('POST');
    expect(init.headers).toBeUndefined();
    expect((init.body as URLSearchParams).get('count')).toBe('5000');
    expect(params.has('count')).toBe(false);
  });

  it('keeps a caller-supplied count', async () => {
    const params = wfsParams();
    params.set('count', '1');

    await getOpenmapsJson(params);

    expect((fetchMock.mock.calls[0][1].body as URLSearchParams).get('count')).toBe('1');
  });

  it('GETs legend requests', async () => {
    await getOpenmapsJson(new URLSearchParams({ service: 'WMS', request: 'GetLegendGraphic' }));

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://openmaps.gov.bc.ca/geo/pub/wms?service=WMS&request=GetLegendGraphic');
    expect(init.method).toBeUndefined();
  });

  it('rejects a non-2xx response', async () => {
    fetchMock.mockResolvedValue(new Response('nope', { status: 502 }));

    await expect(getOpenmapsJson(wfsParams())).rejects.toThrow('HTTP 502');
  });

  it('recognises an aborted fetch', () => {
    expect(isOpenmapsAbort(new DOMException('aborted', 'AbortError'))).toBe(true);
    expect(isOpenmapsAbort(new Error('boom'))).toBe(false);
  });
});
