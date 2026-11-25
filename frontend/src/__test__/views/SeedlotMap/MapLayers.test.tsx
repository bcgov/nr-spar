import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import L from 'leaflet';
import {
  describe, it, expect, vi, beforeEach, afterEach
} from 'vitest';

import MapLayersSync from '../../../views/Seedlot/SeedlotMap/MapLayers/MapLayersSync';
import { MapLayersProvider, useMapLayers } from '../../../views/Seedlot/SeedlotMap/MapLayers/MapLayersContext';
import {
  BASE_LAYERS,
  applySpeciesVisibility,
  buildLayerGroups,
  catalogLayerKey,
  groupLayerIds
} from '../../../views/Seedlot/SeedlotMap/MapLayers/layerDefs';
import LayersPanel from '../../../views/Seedlot/SeedlotMap/LayersPanel';
import { SeedlotPointsLeafletLayer } from '../../../views/Seedlot/SeedlotMap/SeedlotPointsLayer/seedlotPointsLayer';
import { SingleTileWmsLeafletLayer } from '../../../views/Seedlot/SeedlotMap/LeafletMap/SingleTileWmsLayer';
import { getThemeProfile } from '../../../config/leaflet-themes';
import type { SparMapOverlayLayer } from '../../../types/SparMapTypes';

let map: L.Map;
const ctx: { speciesCode: string | null; activeCatalogLayers: string[]; toggleCatalogLayer: ReturnType<typeof vi.fn> } = {
  speciesCode: null,
  activeCatalogLayers: [],
  toggleCatalogLayer: vi.fn()
};

vi.mock('react-leaflet', () => ({ useMap: () => map }));
vi.mock('../../../contexts/SparMapContext', () => ({ useSparMap: () => ctx }));
vi.mock('../../../api-service/seedlotPointsApi', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  fetchSeedlotPoints: vi.fn().mockResolvedValue([])
}));
vi.mock('../../../config/bcgw-catalog', () => ({
  BCGW_CATALOG: [{
    id: 'roads', displayName: 'Roads', description: 'Road lines', wmsUrl: 'https://openmaps.gov.bc.ca/geo/wms', layerName: 'ROADS', format: 'image/png', transparent: true
  }]
}));

const overlay = (id: string, label = id): SparMapOverlayLayer => ({
  id, label, url: 'https://x/wms', layers: id, visible: false, identifyEligible: false, legendEligible: false
});

const layersOnMap = () => {
  const found: L.Layer[] = [];
  map.eachLayer((l) => { found.push(l); });
  return found;
};

const wmsNamesOnMap = () => layersOnMap().map((l) => {
  if (l instanceof SingleTileWmsLeafletLayer) return l.getLegendInfo().layers;
  if (l instanceof L.TileLayer.WMS) return l.wmsParams.layers;
  return null;
}).filter(Boolean);

/** Exposes the layer-state actions to tests, as the Layers panel would use them. */
let actions: ReturnType<typeof useMapLayers>;
const ActionsProbe = () => {
  actions = useMapLayers();
  return null;
};

const renderSync = (theme: 'aoua' | 'COLAREA' = 'aoua') => render(
  <MapLayersProvider>
    <MapLayersSync theme={theme} />
    <ActionsProbe />
  </MapLayersProvider>
);

beforeEach(() => {
  ctx.speciesCode = null;
  ctx.activeCatalogLayers = [];
  ctx.toggleCatalogLayer = vi.fn();
  const el = document.createElement('div');
  document.body.appendChild(el);
  map = L.map(el, { center: [53, -125], zoom: 6 });
});

afterEach(() => {
  map.remove();
  document.body.innerHTML = '';
});

describe('layer definitions', () => {
  it('builds plain rows, groups, and consolidated groups in legacy panel order', () => {
    const groups = buildLayerGroups([
      overlay('active_seedlots', 'All active seedlots'),
      overlay('active_seedlots_fdc', 'FDC'),
      overlay('water_lines', 'Water lines'),
      overlay('water_polys', 'Water polygons'),
      overlay('spz', 'SPZ')
    ]);
    expect(groups.map((g) => g.label)).toEqual(['SPZ', 'Water', 'Active Seedlots']);
    expect(groups[0]).toEqual({ label: 'SPZ', layer: { id: 'spz', label: 'SPZ' } });
    expect(groupLayerIds(groups[1])).toEqual(['water_polys', 'water_lines']);
    // A consolidated group covers its "all species" layer and every child.
    expect(groups[2].layer?.id).toBe('active_seedlots');
    expect(groups[2].children?.map((c) => c.id)).toEqual(['active_seedlots_fdc']);
    expect(groupLayerIds(groups[2])).toEqual(['active_seedlots', 'active_seedlots_fdc']);
  });

  it('turns on the seed plan zone layer for the species in the URL only', () => {
    const overlays = [overlay('spz_grm_fdc'), overlay('spz_grm_pli')];
    expect(applySpeciesVisibility(overlays, 'fdc').map((o) => o.visible)).toEqual([true, false]);
    const unchanged = applySpeciesVisibility(overlays, null);
    expect(unchanged).toEqual(overlays);
    expect(unchanged).not.toBe(overlays);
  });
});

describe('custom layer opacity', () => {
  it('fades seedlot point markers, outline and fill', () => {
    const layer = new SeedlotPointsLeafletLayer({ typeName: 't', activeOnly: null, labelText: 'Seedlot' });
    const marker = L.circleMarker([53, -125]);
    layer.addLayer(marker);
    layer.setOpacity(0.5);
    expect(layer.getOpacity()).toBe(0.5);
    expect(marker.options.opacity).toBe(0.5);
    expect(marker.options.fillOpacity).toBeCloseTo(0.425);
  });

  it('keeps a single-tile WMS opacity for its next image', () => {
    const layer = new SingleTileWmsLeafletLayer({ url: 'https://x/wms', layers: 'a' });
    expect(layer.getOpacity()).toBe(1);
    layer.setOpacity(0.3);
    expect(layer.getOpacity()).toBe(0.3);
  });
});

describe('MapLayersSync', () => {
  it('shows the default base map and the theme\'s default overlays', () => {
    renderSync();
    const defaults = getThemeProfile('aoua').overlays.filter((o) => o.visible && o.renderMode !== 'wfs-points');
    expect(defaults.length).toBeGreaterThan(0);
    const names = wmsNamesOnMap();
    defaults.forEach((o) => expect(names).toContain(o.layers));
    const bases = layersOnMap().filter((l) => l instanceof L.TileLayer && !(l instanceof L.TileLayer.WMS));
    expect(bases).toHaveLength(1);
    expect(actions.baseLayerId).toBe(BASE_LAYERS[0].id);
  });

  it('switches base map and keeps it under the overlays', () => {
    renderSync();
    React.act(() => actions.setBaseLayer('esri-imagery'));
    const bases = layersOnMap().filter(
      (l): l is L.TileLayer => l instanceof L.TileLayer && !(l instanceof L.TileLayer.WMS)
    );
    expect(bases).toHaveLength(1);
    expect((bases[0] as unknown as { _url: string })._url).toContain('World_Imagery');
    const overlayZ = layersOnMap()
      .filter((l): l is L.TileLayer.WMS => l instanceof L.TileLayer.WMS)
      .map((l) => l.options.zIndex ?? 0);
    overlayZ.forEach((z) => expect(z).toBeGreaterThan(bases[0].options.zIndex ?? 0));
  });

  it('turns overlays on and off and applies opacity', () => {
    renderSync();
    const off = getThemeProfile('aoua').overlays.find((o) => !o.visible && !o.singleTile && o.renderMode !== 'wfs-points');
    if (!off) throw new Error('theme has no hidden tiled overlay to test with');
    React.act(() => actions.setLayersVisible([off.id], true));
    const layer = layersOnMap().find(
      (l): l is L.TileLayer.WMS => l instanceof L.TileLayer.WMS && l.wmsParams.layers === off.layers
    );
    expect(layer).toBeDefined();
    React.act(() => actions.setLayerOpacity(off.id, 0.4));
    expect(layer!.options.opacity).toBe(0.4);
    React.act(() => actions.setLayersVisible([off.id], false));
    expect(map.hasLayer(layer!)).toBe(false);
  });

  it('shows the seed plan zone for the species in the URL', () => {
    const spz = getThemeProfile('aoua').overlays.find((o) => o.id.startsWith('spz_grm_') && !o.visible);
    if (!spz) return;
    ctx.speciesCode = spz.id.replace('spz_grm_', '');
    renderSync();
    expect(wmsNamesOnMap()).toContain(spz.layers);
  });

  it('adds catalog layers switched on, and removes them when dropped', () => {
    ctx.activeCatalogLayers = ['roads', 'not-in-catalog'];
    const { rerender } = renderSync();
    expect(wmsNamesOnMap()).toContain('ROADS');
    React.act(() => actions.setLayersVisible([catalogLayerKey('roads')], false));
    expect(wmsNamesOnMap()).not.toContain('ROADS');
    React.act(() => actions.setLayersVisible([catalogLayerKey('roads')], true));
    expect(wmsNamesOnMap()).toContain('ROADS');

    ctx.activeCatalogLayers = [];
    rerender(
      <MapLayersProvider>
        <MapLayersSync theme="aoua" />
        <ActionsProbe />
      </MapLayersProvider>
    );
    expect(wmsNamesOnMap()).not.toContain('ROADS');
  });

  it('shows a re-added catalog layer on and at full opacity, whatever it was before removal', () => {
    const key = catalogLayerKey('roads');
    const rerenderWith = (active: string[]) => {
      ctx.activeCatalogLayers = active;
      return (
        <MapLayersProvider>
          <MapLayersSync theme="aoua" />
          <ActionsProbe />
        </MapLayersProvider>
      );
    };
    const { rerender } = render(rerenderWith(['roads']));
    React.act(() => {
      actions.setLayersVisible([key], false);
      actions.setLayerOpacity(key, 0);
    });
    expect(wmsNamesOnMap()).not.toContain('ROADS');

    rerender(rerenderWith([]));
    rerender(rerenderWith(['roads']));
    expect(wmsNamesOnMap()).toContain('ROADS');
    expect(actions.visible[key]).toBe(true);
    expect(actions.opacity[key]).toBe(1);
  });

  it('removes every layer it added on unmount', () => {
    ctx.activeCatalogLayers = ['roads'];
    const { unmount } = renderSync();
    expect(layersOnMap().length).toBeGreaterThan(0);
    unmount();
    expect(layersOnMap()).toHaveLength(0);
  });
});

describe('LayersPanel', () => {
  const renderPanel = (onClose = vi.fn()) => render(
    <MapLayersProvider>
      <LayersPanel theme="aoua" onClose={onClose} />
      <ActionsProbe />
    </MapLayersProvider>
  );
  const groups = buildLayerGroups(getThemeProfile('aoua').overlays);
  // A multi-layer group with no child sharing the group's own label (the
  // legacy "Transportation" group has a "Transportation" child).
  const multi = groups.find(
    (g) => g.children && !g.layer && g.children.every((c) => c.label !== g.label)
  )!;
  const single = groups.find((g) => !g.children)!;

  it('lists the base maps and every layer group', () => {
    renderPanel();
    expect(screen.getByLabelText('Base map')).toHaveValue(BASE_LAYERS[0].id);
    groups.forEach((g) => expect(screen.getByText(g.label)).toBeInTheDocument());
  });

  it('changes the base map, which has no opacity slider', () => {
    renderPanel();
    fireEvent.change(screen.getByLabelText('Base map'), { target: { value: 'esri-topo' } });
    expect(actions.baseLayerId).toBe('esri-topo');
    expect(screen.queryByLabelText('Base map opacity')).not.toBeInTheDocument();
  });

  it('shows an opacity slider once a layer is on', () => {
    renderPanel();
    const { label, layer } = single;
    expect(screen.queryByLabelText(`${label} opacity`)).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(label));
    expect(actions.visible[layer!.id]).toBe(true);
    fireEvent.change(screen.getByLabelText(`${label} opacity`), { target: { value: '25' } });
    expect(actions.opacity[layer!.id]).toBe(0.25);
  });

  it('toggles a whole group and expands it to show its layers', () => {
    renderPanel();
    fireEvent.click(screen.getByLabelText(multi.label));
    multi.children!.forEach((c) => expect(actions.visible[c.id]).toBe(true));
    expect(screen.queryByText(multi.children![0].label)).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(`Expand ${multi.label}`));
    expect(screen.getByLabelText(multi.children![0].label)).toBeChecked();
    fireEvent.click(screen.getByLabelText(multi.children![0].label));
    expect(screen.getByLabelText(multi.label)).toHaveProperty('indeterminate', true);
  });

  it('filters by search, showing matching layers inside their group', () => {
    renderPanel();
    const child = multi.children![0];
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: child.label } });
    expect(screen.getByLabelText(child.label)).toBeInTheDocument();
    expect(screen.queryByText(single.label)).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzz-no-such-layer' } });
    expect(screen.getByText(/No layers match/)).toBeInTheDocument();
  });

  it('while searching for one species, group and All switch that species only, not the "all species" layer', () => {
    const species = groups.find((g) => g.layer && g.children?.length)!;
    const child = species.children![0];
    expect(species.label.toLowerCase()).not.toContain(child.label.toLowerCase());
    renderPanel();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: child.label } });

    fireEvent.click(screen.getByLabelText('All'));
    expect(actions.visible[child.id]).toBe(true);
    expect(actions.visible[species.layer!.id]).not.toBe(true);
    fireEvent.click(screen.getByLabelText('All'));
    expect(actions.visible[child.id]).toBe(false);

    fireEvent.click(screen.getByLabelText(species.label));
    expect(actions.visible[child.id]).toBe(true);
    expect(actions.visible[species.layer!.id]).not.toBe(true);
  });

  it('turns everything listed on or off with All', () => {
    renderPanel();
    fireEvent.click(screen.getByLabelText('All'));
    groups.flatMap(groupLayerIds).forEach((id) => expect(actions.visible[id]).toBe(true));
    fireEvent.click(screen.getByLabelText('All'));
    groups.flatMap(groupLayerIds).forEach((id) => expect(actions.visible[id]).toBe(false));
  });

  it('switches a species group and all its species layers together, like every other group', () => {
    const species = groups.find((g) => g.layer && g.children?.length)!;
    const everyId = [species.layer!.id, ...species.children!.map((c) => c.id)];
    const child = species.children![0];
    renderPanel();
    fireEvent.click(screen.getByLabelText(species.label));
    everyId.forEach((id) => expect(actions.visible[id]).toBe(true));
    fireEvent.click(screen.getByLabelText(species.label));
    everyId.forEach((id) => expect(actions.visible[id]).toBe(false));

    // One species on its own leaves the group part-checked; All then turns
    // everything off, that species included.
    fireEvent.click(screen.getByLabelText(`Expand ${species.label}`));
    fireEvent.click(screen.getByLabelText(child.label));
    expect(screen.getByLabelText(species.label)).toHaveProperty('indeterminate', true);
    fireEvent.click(screen.getByLabelText('All'));
    everyId.forEach((id) => expect(actions.visible[id]).toBe(true));
    fireEvent.click(screen.getByLabelText('All'));
    everyId.forEach((id) => expect(actions.visible[id]).toBe(false));
    expect(screen.getByLabelText('All')).not.toBeChecked();
  });

  it('expands and collapses every group', () => {
    renderPanel();
    fireEvent.click(screen.getByLabelText('Expand all groups'));
    expect(screen.getByLabelText(multi.children![0].label)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Collapse all groups'));
    expect(screen.queryByLabelText(multi.children![0].label)).not.toBeInTheDocument();
  });

  it('lists user layers, which can be hidden, faded, or removed', () => {
    ctx.activeCatalogLayers = ['roads'];
    renderPanel();
    const key = catalogLayerKey('roads');
    fireEvent.change(screen.getByLabelText('Roads opacity'), { target: { value: '50' } });
    expect(actions.opacity[key]).toBe(0.5);
    fireEvent.click(screen.getByLabelText('Roads'));
    expect(actions.visible[key]).toBe(false);
    fireEvent.click(screen.getByLabelText('Remove Roads'));
    expect(ctx.toggleCatalogLayer).toHaveBeenCalledWith('roads');
  });

  it('opens the DataBC catalog and closes', () => {
    const onClose = vi.fn();
    renderPanel(onClose);
    fireEvent.click(screen.getByText('Add DataBC layers'));
    expect(screen.getByTestId('layer-catalog-modal')).toHaveClass('is-visible');
    fireEvent.click(screen.getByLabelText('Close layers'));
    expect(onClose).toHaveBeenCalled();
  });
});
