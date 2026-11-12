import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import L from 'leaflet';
import {
  describe, it, expect, vi, beforeEach, afterEach
} from 'vitest';

import TreeLayersControl, { applySpeciesVisibility } from '../../../views/Seedlot/SeedlotMap/TreeLayersControl';
import { SeedlotPointsLeafletLayer } from '../../../views/Seedlot/SeedlotMap/SeedlotPointsLayer/seedlotPointsLayer';
import { SingleTileWmsLeafletLayer } from '../../../views/Seedlot/SeedlotMap/LeafletMap/SingleTileWmsLayer';
import { getThemeProfile } from '../../../config/leaflet-themes';
import type { SparMapOverlayLayer } from '../../../types/SparMapTypes';

let map: L.Map;
const ctx: { speciesCode: string | null } = { speciesCode: null };

vi.mock('react-leaflet', () => ({ useMap: () => map }));
vi.mock('../../../contexts/SparMapContext', () => ({ useSparMap: () => ctx }));
vi.mock('../../../api-service/seedlotPointsApi', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  fetchSeedlotPoints: vi.fn().mockResolvedValue([])
}));

const layersOnMap = () => {
  const found: L.Layer[] = [];
  map.eachLayer((l) => { found.push(l); });
  return found;
};

beforeEach(() => {
  ctx.speciesCode = null;
  const el = document.createElement('div');
  document.body.appendChild(el);
  map = L.map(el, { center: [53, -125], zoom: 6 });
});

afterEach(() => {
  map.remove();
  document.body.innerHTML = '';
});

describe('applySpeciesVisibility', () => {
  const overlays = [
    { id: 'spz_grm_fdc', visible: false },
    { id: 'spz_grm_pli', visible: false }
  ] as SparMapOverlayLayer[];

  it('turns on the seed plan zone layer for the species in the URL only', () => {
    expect(applySpeciesVisibility(overlays, 'fdc').map((o) => o.visible)).toEqual([true, false]);
  });

  it('returns an unchanged copy without a species', () => {
    const result = applySpeciesVisibility(overlays, null);
    expect(result).toEqual(overlays);
    expect(result).not.toBe(overlays);
  });
});

describe('TreeLayersControl', () => {
  it('adds the basemap, the default overlays and a collapsed layer tree', () => {
    render(<TreeLayersControl theme="aoua" />);
    const container = document.querySelector('.leaflet-control-layers') as HTMLElement;
    expect(container).not.toBeNull();
    expect(container).not.toHaveClass('leaflet-control-layers-expanded');
    expect(layersOnMap().some((l) => l instanceof L.TileLayer && !(l instanceof L.TileLayer.WMS))).toBe(true);

    const visibleIds = getThemeProfile('aoua').overlays.filter((o) => o.visible).map((o) => o.id);
    expect(visibleIds.length).toBeGreaterThan(0);
    expect(container.textContent).toContain('ESRI World Imagery (satellite)');
  });

  it('builds WFS point layers and single-tile WMS layers where the config asks for them', () => {
    render(<TreeLayersControl theme="aoua" />);
    const all = layersOnMap();
    const profile = getThemeProfile('aoua');
    const visible = profile.overlays.filter((o) => o.visible);
    if (visible.some((o) => o.renderMode === 'wfs-points')) {
      expect(all.some((l) => l instanceof SeedlotPointsLeafletLayer)).toBe(true);
    }
    if (visible.some((o) => o.singleTile)) {
      expect(all.some((l) => l instanceof SingleTileWmsLeafletLayer)).toBe(true);
    }
  });

  it('opens and closes the tree from its toggle', () => {
    render(<TreeLayersControl theme="aoua" />);
    const container = document.querySelector('.leaflet-control-layers') as HTMLElement;
    const toggle = container.querySelector('.leaflet-control-layers-toggle') as HTMLElement;
    fireEvent.click(toggle);
    expect(container).toHaveClass('leaflet-control-layers-expanded');
    fireEvent.click(toggle);
    expect(container).not.toHaveClass('leaflet-control-layers-expanded');
  });

  it('shows the seed plan zone for the species in the URL', () => {
    const spz = getThemeProfile('aoua').overlays.find((o) => o.id.startsWith('spz_grm_') && !o.visible);
    if (!spz) return;
    ctx.speciesCode = spz.id.replace('spz_grm_', '');
    render(<TreeLayersControl theme="aoua" />);
    const wmsLayerNames = layersOnMap().map((l) => {
      if (l instanceof SingleTileWmsLeafletLayer) return l.getLegendInfo().layers;
      if (l instanceof L.TileLayer.WMS) return l.wmsParams.layers;
      return null;
    });
    expect(wmsLayerNames).toContain(spz.layers);
  });

  it('skips an overlay it cannot build and keeps the rest', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const profile = getThemeProfile('aoua');
    const original = profile.overlays;
    (profile as { overlays: SparMapOverlayLayer[] }).overlays = [
      ...original,
      {
        ...original[0], id: 'not_a_points_layer', renderMode: 'wfs-points', visible: true
      } as SparMapOverlayLayer
    ];
    try {
      render(<TreeLayersControl theme="aoua" />);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('not_a_points_layer'), expect.any(Error));
      expect(document.querySelector('.leaflet-control-layers')).not.toBeNull();
    } finally {
      (profile as { overlays: SparMapOverlayLayer[] }).overlays = original;
      warn.mockRestore();
    }
  });

  it('removes its control and layers on unmount', () => {
    const { unmount } = render(<TreeLayersControl theme="aoua" />);
    unmount();
    expect(document.querySelector('.leaflet-control-layers')).toBeNull();
    expect(layersOnMap()).toHaveLength(0);
  });
});
