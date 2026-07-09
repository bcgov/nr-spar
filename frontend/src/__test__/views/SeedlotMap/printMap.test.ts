import { describe, it, expect } from 'vitest';

import { buildPrintLegendHtml } from '../../../views/Seedlot/SeedlotMap/printMap';
import type { LegendOverlayData } from '../../../api-service/legendApi';

const becOverlay: LegendOverlayData = {
  id: 'bec',
  label: 'BEC Zones',
  rules: [
    {
      label: 'IDF',
      swatch: {
        geometry: 'polygon',
        fill: '#E6E600',
        fillOpacity: 0.65,
        stroke: '#ff6500',
        strokeWidth: 1,
        strokeOpacity: 0.65
      }
    }
  ]
};

describe('buildPrintLegendHtml', () => {
  it('renders one section per overlay with the overlay and rule labels', () => {
    const html = buildPrintLegendHtml([becOverlay]);
    expect(html).toContain('BEC Zones');
    expect(html).toContain('IDF');
  });

  it('renders a polygon swatch with its fill and stroke inline', () => {
    const html = buildPrintLegendHtml([becOverlay]);
    expect(html).toContain('#E6E600');
    expect(html).toContain('#ff6500');
  });

  it('returns an empty string when there is no legend data', () => {
    expect(buildPrintLegendHtml([])).toBe('');
  });

  it('renders a point swatch as a circle', () => {
    const html = buildPrintLegendHtml([{
      id: 'sp',
      label: 'Species',
      rules: [{
        label: 'Fd',
        swatch: {
          geometry: 'point', fill: '#1f6fdb', fillOpacity: 1, stroke: '#212121', strokeWidth: 1, strokeOpacity: 1
        }
      }]
    }]);
    expect(html).toContain('border-radius:50%');
  });

  it('renders a line swatch as a coloured rule', () => {
    const html = buildPrintLegendHtml([{
      id: 'ln',
      label: 'Roads',
      rules: [{
        label: 'Highway',
        swatch: {
          geometry: 'line', fill: null, fillOpacity: 0, stroke: '#1f6fdb', strokeWidth: 3, strokeOpacity: 1
        }
      }]
    }]);
    expect(html).toContain('border-top:3px solid #1f6fdb');
  });

  it('escapes overlay and rule labels so the print window stays safe', () => {
    const html = buildPrintLegendHtml([{
      id: 'x',
      label: 'A & B',
      rules: [{
        label: '<script>alert(1)</script>',
        swatch: {
          geometry: 'polygon', fill: '#fff', fillOpacity: 1, stroke: '#000', strokeWidth: 1, strokeOpacity: 1
        }
      }]
    }]);
    expect(html).toContain('A &amp; B');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });
});
