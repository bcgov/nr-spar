import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import L from 'leaflet';
import {
  describe, it, expect, vi, beforeEach
} from 'vitest';

import AoiDrawLayer from '../../../views/Seedlot/SeedlotMap/AoiDrawLayer';
import { getCollectionGeometry } from '../../../api-service/seedlotAPI';
import { validatePolygons } from '../../../views/Seedlot/SeedlotMap/AoiToolbar/aoiValidation';
import type { AoiPolygon } from '../../../types/SparMapTypes';

type Handler = (e?: unknown) => void;
type Controls = Record<string, ((...args: never[]) => void) | null>;

let geomanLayers: unknown[] = [];
const handlers: Record<string, Handler> = {};
const fakeMap = {
  on: vi.fn((name: string, fn: Handler) => { handlers[name] = fn; }),
  off: vi.fn((name: string) => { delete handlers[name]; }),
  fitBounds: vi.fn(),
  addLayer: vi.fn((layer: unknown) => { geomanLayers.push(layer); }),
  pm: {
    addControls: vi.fn(),
    setGlobalOptions: vi.fn(),
    removeControls: vi.fn(),
    getGeomanLayers: vi.fn(() => geomanLayers),
    enableDraw: vi.fn(),
    disableDraw: vi.fn(),
    enableGlobalEditMode: vi.fn(),
    disableGlobalEditMode: vi.fn(),
    enableGlobalRemovalMode: vi.fn(),
    disableGlobalRemovalMode: vi.fn()
  }
};

const ctx = {
  addAoi: vi.fn(),
  clearAois: vi.fn(),
  setAois: vi.fn(),
  _setMapControls: vi.fn(),
  setLiveAoiValidation: vi.fn()
};

vi.mock('react-leaflet', () => ({ useMap: () => fakeMap }));
vi.mock('@geoman-io/leaflet-geoman-free', () => ({}));
vi.mock('../../../contexts/SparMapContext', () => ({ useSparMap: () => ctx }));
vi.mock('../../../api-service/seedlotAPI', () => ({ getCollectionGeometry: vi.fn() }));
vi.mock('../../../views/Seedlot/SeedlotMap/AoiToolbar/aoiValidation', () => ({
  validatePolygons: vi.fn(() => ({ ok: true, message: '' }))
}));

const square: AoiPolygon = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [[[-123, 49], [-122, 49], [-122, 50], [-123, 50], [-123, 49]]]
  }
} as AoiPolygon;

const fakeLayer = (feature: unknown) => ({ toGeoJSON: () => feature, remove: vi.fn() });

const renderLayer = (state?: unknown, path = '/map/60001') => render(
  <MemoryRouter initialEntries={[{ pathname: path, state }]}>
    <Routes>
      <Route path="/map/:seedlotNumber" element={<AoiDrawLayer />} />
      <Route path="/map" element={<AoiDrawLayer />} />
    </Routes>
  </MemoryRouter>
);

const controls = (): Controls => ctx._setMapControls.mock.calls[0][0];

beforeEach(() => {
  vi.clearAllMocks();
  geomanLayers = [];
  Object.keys(handlers).forEach((k) => delete handlers[k]);
  vi.mocked(getCollectionGeometry).mockResolvedValue(null as never);
});

describe('AoiDrawLayer setup', () => {
  it('hides the Geoman controls, styles drawing and registers the bridge', () => {
    const { unmount } = renderLayer(undefined, '/map');
    expect(fakeMap.pm.addControls).toHaveBeenCalledWith(expect.objectContaining({ drawPolygon: false }));
    expect(fakeMap.pm.setGlobalOptions).toHaveBeenCalledWith(expect.objectContaining({ removeVertexOn: 'contextmenu' }));
    expect(Object.keys(handlers)).toEqual(['pm:create', 'pm:edit', 'pm:remove']);

    unmount();
    expect(fakeMap.pm.removeControls).toHaveBeenCalled();
    expect(Object.keys(handlers)).toEqual([]);
    expect(ctx._setMapControls).toHaveBeenLastCalledWith(expect.objectContaining({ zoomToAois: null }));
  });
});

describe('AoiDrawLayer events', () => {
  it('adds a drawn polygon and validates it', async () => {
    renderLayer(undefined, '/map');
    geomanLayers = [fakeLayer(square)];
    handlers['pm:create']({ layer: fakeLayer(square) });
    expect(ctx.addAoi).toHaveBeenCalledWith(square);
    await waitFor(() => expect(ctx.setLiveAoiValidation).toHaveBeenCalledWith({ ok: true, message: '' }));
  });

  it('drops a drawn line instead of treating it as an AOI', () => {
    renderLayer(undefined, '/map');
    const line = fakeLayer({ type: 'Feature', geometry: { type: 'LineString', coordinates: [] } });
    handlers['pm:create']({ layer: line });
    expect(line.remove).toHaveBeenCalled();
    expect(ctx.addAoi).not.toHaveBeenCalled();
  });

  it('rebuilds the AOI list from the map on edit, skipping broken layers', () => {
    renderLayer(undefined, '/map');
    geomanLayers = [
      fakeLayer(square),
      { toGeoJSON: () => { throw new Error('detached'); }, remove: vi.fn() }
    ];
    handlers['pm:edit']();
    expect(ctx.setAois).toHaveBeenCalledWith([square]);
    expect(validatePolygons).toHaveBeenCalledWith([square]);
  });

  it('clears the AOIs when the last polygon is removed', () => {
    renderLayer(undefined, '/map');
    handlers['pm:remove']();
    expect(ctx.clearAois).toHaveBeenCalled();
    expect(ctx.setLiveAoiValidation).toHaveBeenCalledWith(null);

    geomanLayers = [fakeLayer(square)];
    handlers['pm:remove']();
    expect(ctx.setAois).toHaveBeenCalledWith([square]);
  });
});

describe('AoiDrawLayer toolbar bridge', () => {
  it('switches Geoman modes', () => {
    renderLayer(undefined, '/map');
    const c = controls();
    c.startDraw!();
    expect(fakeMap.pm.enableDraw).toHaveBeenLastCalledWith('Polygon');
    c.startDrawRectangle!();
    expect(fakeMap.pm.enableDraw).toHaveBeenLastCalledWith('Rectangle');
    c.startDrawCircle!();
    expect(fakeMap.pm.enableDraw).toHaveBeenLastCalledWith('Circle');
    c.startDrawLine!();
    expect(fakeMap.pm.enableDraw).toHaveBeenLastCalledWith('Line');
    c.startEdit!();
    expect(fakeMap.pm.enableGlobalEditMode).toHaveBeenCalled();
    c.startRemovalMode!();
    expect(fakeMap.pm.enableGlobalRemovalMode).toHaveBeenCalled();
    c.cancelAoiMode!();
    expect(fakeMap.pm.disableDraw).toHaveBeenCalled();
    expect(fakeMap.pm.disableGlobalRemovalMode).toHaveBeenCalled();
  });

  it('clears every layer, tolerating ones already detached', () => {
    renderLayer(undefined, '/map');
    const ok = fakeLayer(square);
    const detached = { toGeoJSON: () => square, remove: vi.fn(() => { throw new Error('gone'); }) };
    geomanLayers = [ok, detached];
    controls().clearMapLayers!();
    expect(ok.remove).toHaveBeenCalled();
    expect(detached.remove).toHaveBeenCalled();
  });

  it('removes only the last layer, and does nothing when empty', () => {
    renderLayer(undefined, '/map');
    controls().removeLastMapLayer!();
    expect(ctx.setAois).not.toHaveBeenCalled();

    const first = fakeLayer(square);
    const last = fakeLayer(square);
    geomanLayers = [first, last];
    last.remove.mockImplementation(() => { geomanLayers.pop(); });
    controls().removeLastMapLayer!();
    expect(first.remove).not.toHaveBeenCalled();
    expect(ctx.setAois).toHaveBeenCalledWith([square]);
  });

  it('adds imported polygons to the map and zooms to them', () => {
    renderLayer(undefined, '/map');
    controls().addImportedLayersToMap!([] as never);
    expect(fakeMap.addLayer).not.toHaveBeenCalled();

    controls().addImportedLayersToMap!([square] as never);
    expect(geomanLayers).toHaveLength(1);
    expect(geomanLayers[0]).toBeInstanceOf(L.Polygon);
    expect(ctx.setAois).toHaveBeenCalledWith([expect.objectContaining({ geometry: expect.objectContaining({ type: 'Polygon' }) })]);
    expect(fakeMap.fitBounds).toHaveBeenCalled();
  });

  it('zooms to the drawn AOIs, ignoring layers without bounds', () => {
    renderLayer(undefined, '/map');
    controls().zoomToAois!();
    expect(fakeMap.fitBounds).not.toHaveBeenCalled();

    geomanLayers = [L.polygon([[49, -123], [50, -122], [49, -122]]), { notALayer: true }];
    controls().zoomToAois!();
    expect(fakeMap.fitBounds).toHaveBeenCalledTimes(1);
  });
});

describe('AoiDrawLayer preload', () => {
  it('seeds a draft MultiPolygon handed over from the wizard', () => {
    const multi = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'MultiPolygon', coordinates: [square.geometry.coordinates, square.geometry.coordinates] }
    };
    renderLayer({ initialAoiGeoJson: JSON.stringify(multi) });
    expect(geomanLayers).toHaveLength(2);
    expect(getCollectionGeometry).not.toHaveBeenCalled();
  });

  it('accepts a bare Polygon and ignores unknown geometry', () => {
    renderLayer({ initialAoiGeoJson: JSON.stringify(square.geometry) });
    expect(geomanLayers).toHaveLength(1);
  });

  it('ignores a draft it cannot parse', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderLayer({ initialAoiGeoJson: '{not json' });
    expect(warn).toHaveBeenCalled();
    expect(geomanLayers).toHaveLength(0);
    warn.mockRestore();
  });

  it('does not clobber polygons already on the map', () => {
    geomanLayers = [fakeLayer(square)];
    renderLayer({ initialAoiGeoJson: JSON.stringify(square) });
    expect(fakeMap.addLayer).not.toHaveBeenCalled();
  });

  it('loads the saved collection geometry for a submitted seedlot', async () => {
    vi.mocked(getCollectionGeometry).mockResolvedValue({ geometryGeoJson: JSON.stringify(square.geometry) } as never);
    renderLayer();
    await waitFor(() => expect(geomanLayers).toHaveLength(1));
    expect(getCollectionGeometry).toHaveBeenCalledWith('60001');
  });

  it('stays usable when there is no saved geometry or the fetch fails', async () => {
    renderLayer();
    await waitFor(() => expect(getCollectionGeometry).toHaveBeenCalled());
    expect(geomanLayers).toHaveLength(0);

    vi.mocked(getCollectionGeometry).mockRejectedValue(new Error('500'));
    renderLayer();
    await waitFor(() => expect(getCollectionGeometry).toHaveBeenCalledTimes(2));
    expect(geomanLayers).toHaveLength(0);
  });
});
