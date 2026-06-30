import { describe, it, expect } from 'vitest';

import {
  parseLegend,
  parseLegendRules,
  buildLegendJsonUrl,
  wgs84BoundsToBcAlbersBbox,
  type GsLegendResponse
} from '../../api-service/legendApi';
import type { SparMapOverlayLayer } from '../../types/SparMapTypes';

const overlay: SparMapOverlayLayer = {
  id: 'spz',
  label: 'SPZ',
  url: 'https://openmaps.gov.bc.ca/geo/pub/wms',
  layers: 'pub:WHSE_FOREST_VEGETATION.SEED_PLAN_ZONE_POLY_MVW',
  visible: true,
  identifyEligible: true,
  legendEligible: true
};

// Trimmed real GeoServer response (SPZ layer, format=application/json).
const SPZ_RESPONSE: GsLegendResponse = {
  Legend: [{
    layerName: 'WHSE_FOREST_VEGETATION.SEED_PLAN_ZONE_POLY_MVW',
    title: 'Seed Planning Zones',
    rules: [
      {
        name: 'Georgia Lowlands',
        title: 'Georgia Lowlands',
        symbolizers: [{
          Polygon: {
            stroke: '#ff6500', 'stroke-width': 1, 'stroke-opacity': '0.65',
            fill: '#E6E600', 'fill-opacity': '0.65'
          }
        }]
      },
      // A catch-all "else" rule with no title — should label as "Other".
      {
        name: '',
        title: '',
        symbolizers: [{
          Polygon: { stroke: '#ff6500', fill: '#cccccc', 'fill-opacity': '0.65' }
        }]
      }
    ]
  }]
};

describe('legendApi.parseLegendRules', () => {
  it('maps a polygon rule to a labelled swatch with fill + stroke', () => {
    const rules = parseLegendRules(SPZ_RESPONSE);
    expect(rules[0]).toEqual({
      label: 'Georgia Lowlands',
      swatch: {
        geometry: 'polygon',
        fill: '#E6E600',
        fillOpacity: 0.65,
        stroke: '#ff6500',
        strokeWidth: 1,
        strokeOpacity: 0.65
      }
    });
  });

  it('labels an empty-title rule "Other"', () => {
    const rules = parseLegendRules(SPZ_RESPONSE);
    expect(rules[1].label).toBe('Other');
  });

  it('parses a line symbolizer', () => {
    const rules = parseLegendRules({
      Legend: [{ rules: [{ title: 'River', symbolizers: [{ Line: { stroke: '#1f6fdb', 'stroke-width': 2 } }] }] }]
    });
    expect(rules[0]).toEqual({
      label: 'River',
      swatch: {
        geometry: 'line', fill: null, fillOpacity: 0, stroke: '#1f6fdb', strokeWidth: 2, strokeOpacity: 1
      }
    });
  });

  it('parses a point symbolizer (graphic fill)', () => {
    const rules = parseLegendRules({
      Legend: [{ rules: [{ title: 'Seedlot', symbolizers: [{ Point: { graphics: [{ fill: '#cc0000' }] } }] }] }]
    });
    expect(rules[0].swatch.geometry).toBe('point');
    expect(rules[0].swatch.fill).toBe('#cc0000');
  });

  it('drops rules with no renderable symbolizer', () => {
    const rules = parseLegendRules({ Legend: [{ rules: [{ title: 'Label only', symbolizers: [{}] }] }] });
    expect(rules).toHaveLength(0);
  });

  it('returns [] for a malformed response', () => {
    expect(parseLegendRules({} as GsLegendResponse)).toEqual([]);
    expect(parseLegendRules({ Legend: [] })).toEqual([]);
  });

  it('extracts the layer title via parseLegend', () => {
    expect(parseLegend(SPZ_RESPONSE).title).toBe('Seed Planning Zones');
    expect(parseLegend({} as GsLegendResponse).title).toBeNull();
  });
});

describe('legendApi.buildLegendJsonUrl', () => {
  it('requests JSON format and no hideEmptyRules without a bbox', () => {
    const url = buildLegendJsonUrl(overlay);
    expect(url).toContain('request=GetLegendGraphic');
    expect(url).toContain('format=application%2Fjson');
    expect(url).not.toContain('hideEmptyRules');
  });

  it('adds hideEmptyRules + EPSG:3005 bbox when a bbox is supplied', () => {
    const url = buildLegendJsonUrl(overlay, '1180000,380000,1220000,420000');
    expect(url).toContain('LEGEND_OPTIONS=hideEmptyRules%3Atrue');
    expect(url).toContain('srs=EPSG%3A3005');
    expect(url).toContain('bbox=1180000%2C380000%2C1220000%2C420000');
  });
});

describe('legendApi.wgs84BoundsToBcAlbersBbox', () => {
  it('returns an ordered minE,minN,maxE,maxN bbox', () => {
    const bbox = wgs84BoundsToBcAlbersBbox([-123.6, 48.4], [-123.2, 48.7]);
    const [minE, minN, maxE, maxN] = bbox.split(',').map(Number);
    expect(minE).toBeLessThan(maxE);
    expect(minN).toBeLessThan(maxN);
    // Victoria area in BC Albers sits roughly around easting ~1.18M, northing ~0.38M.
    expect(minE).toBeGreaterThan(1_000_000);
    expect(minN).toBeGreaterThan(300_000);
  });
});
