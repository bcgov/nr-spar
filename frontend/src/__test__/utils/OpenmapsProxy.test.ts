import { describe, expect, it } from 'vitest';

import { buildLegendJsonUrl } from '../../api-service/legendApi';
import { buildOpenmapsProxyUrl } from '../../api-service/openmapsProxy';
import { buildSeedlotPointsWfsUrl } from '../../api-service/seedlotPointsApi';

describe('OpenMaps SPAR proxy URLs', () => {
  it('send WFS queries to /api/openmaps instead of openmaps.gov.bc.ca', () => {
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

    expect(url).toContain('/api/openmaps');
    expect(url).not.toContain('openmaps.gov.bc.ca');
    expect(url).toContain('service=WFS');
    expect(url).toContain('request=GetFeature');
    expect(url).toContain('ACTIVE_IND');
  });

  it('send legend queries to /api/openmaps', () => {
    const url = buildLegendJsonUrl({
      url: 'https://openmaps.gov.bc.ca/geo/pub/wms',
      layers: 'pub:WHSE_FOREST_VEGETATION.SEED_PLAN_ZONE_POLY_MVW',
      styles: '4459'
    }, '959229.3,1010027.0,975584.7,1022905.8');

    expect(url).toContain('/api/openmaps');
    expect(url).toContain('request=GetLegendGraphic');
    expect(url).toContain('format=application%2Fjson');
    expect(url).toContain('style=4459');
  });

  it('keeps tile WMS hosts out of the JSON proxy helper', () => {
    const params = new URLSearchParams({
      service: 'WFS',
      request: 'GetFeature',
      typeNames: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY',
      outputFormat: 'application/json'
    });
    expect(buildOpenmapsProxyUrl(params)).toContain('/api/openmaps?');
  });
});
