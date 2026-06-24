import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import LegendPanel, {
  buildLegendUrl,
} from '../../../views/Seedlot/SeedlotMap/LegendPanel';
import type { SparMapOverlayLayer } from '../../../types/SparMapTypes';

/**
 * Unit tests for the LEGEND panel. Covers the accordion rendering
 * branch, the empty-state Tile branch, and the WMS URL builder — the
 * URL composition is the full contract of the legend fetch so we want
 * direct assertions on it.
 */

describe('buildLegendUrl', () => {
  const baseOverlay: SparMapOverlayLayer = {
    id: 'test-layer',
    label: 'Test Layer',
    url: 'https://openmaps.gov.bc.ca/geo/pub/wms',
    layers: 'pub:WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY',
    visible: true,
    identifyEligible: true,
    legendEligible: true,
  };

  it('appends GetLegendGraphic params to a WMS URL without a query string', () => {
    const url = buildLegendUrl(baseOverlay);
    expect(url.startsWith('https://openmaps.gov.bc.ca/geo/pub/wms?')).toBe(true);
    expect(url).toContain('service=WMS');
    expect(url).toContain('version=1.3.0');
    expect(url).toContain('request=GetLegendGraphic');
    expect(url).toContain('format=image%2Fpng');
    expect(url).toContain('transparent=true');
    // URLSearchParams encodes the colon in pub:WHSE_... → pub%3A...
    expect(url).toMatch(/layer=pub%3AWHSE_FOREST_VEGETATION\.BEC_BIOGEOCLIMATIC_POLY/);
  });

  it('uses the first layer name when the overlay lists multiple comma-separated layers', () => {
    const multiLayerOverlay: SparMapOverlayLayer = {
      ...baseOverlay,
      layers: 'pub:LAYER_ONE,pub:LAYER_TWO,pub:LAYER_THREE',
    };
    const url = buildLegendUrl(multiLayerOverlay);
    expect(url).toMatch(/layer=pub%3ALAYER_ONE/);
    expect(url).not.toMatch(/layer=pub%3ALAYER_TWO/);
  });

  it('joins params with & when the overlay URL already has a query string', () => {
    const urlWithQuery: SparMapOverlayLayer = {
      ...baseOverlay,
      url: 'https://example.com/wms?token=abc',
    };
    const url = buildLegendUrl(urlWithQuery);
    expect(url.startsWith('https://example.com/wms?token=abc&')).toBe(true);
    expect(url).toContain('service=WMS');
  });

  it('passes an overlay style through to GetLegendGraphic', () => {
    const styledOverlay: SparMapOverlayLayer = {
      ...baseOverlay,
      styles: '1414',
    };
    const url = buildLegendUrl(styledOverlay);
    expect(url).toContain('style=1414');
  });
});

describe('LegendPanel', () => {
  it('renders an accordion item per visible, legend-eligible overlay (aoua)', () => {
    render(<LegendPanel theme="aoua" />);
    // Wrapper renders with the test id regardless of branch
    expect(screen.queryByTestId('legend-panel')).toBeTruthy();
    // aoua's defaults include the SPZ Natural Stand layer (visible +
    // legend-eligible). The transportation layer is visibility-off so
    // should not render an accordion item.
    expect(screen.queryByTestId('legend-panel-item-spz_natural_stand')).toBeTruthy();
    expect(screen.queryByTestId('legend-panel-item-transportation')).toBeFalsy();
  });

  it('renders a legend image with alt text for each visible overlay', () => {
    render(<LegendPanel theme="aoua" />);
    const img = screen.queryByTestId('legend-panel-image-spz_natural_stand') as HTMLImageElement | null;
    expect(img).toBeTruthy();
    expect(img?.getAttribute('alt')).toMatch(/Legend for Seed Plan Zones - Natural Stand/);
    expect(img?.getAttribute('src')).toMatch(/GetLegendGraphic/);
  });

  it('renders the empty-state Tile when no overlays are visible + legend-eligible', async () => {
    // Every shipped theme has at least one default-on legend-eligible
    // overlay now (matching the legacy CWM defaults). Exercise the
    // empty-state branch by stubbing the theme registry to return a
    // profile with no overlays for this test only.
    vi.resetModules();
    vi.doMock('../../../config/leaflet-themes', async (orig) => {
      const actual = await orig<typeof import('../../../config/leaflet-themes')>();
      const realDefault = actual.getThemeProfile('default');
      return {
        ...actual,
        getThemeProfile: () => ({ ...realDefault, overlays: [] }),
      };
    });
    const { default: LegendPanelStubbed } = await import(
      '../../../views/Seedlot/SeedlotMap/LegendPanel'
    );
    render(<LegendPanelStubbed theme="default" />);
    expect(screen.queryByTestId('legend-panel-empty')).toBeTruthy();
    expect(screen.queryByText(/No legend available for this theme/)).toBeTruthy();
    vi.doUnmock('../../../config/leaflet-themes');
  });
});
