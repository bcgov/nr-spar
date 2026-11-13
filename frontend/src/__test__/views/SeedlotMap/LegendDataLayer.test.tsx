import React from 'react';
import { render, act } from '@testing-library/react';
import L from 'leaflet';
import {
  describe, it, expect, vi, beforeEach, afterEach
} from 'vitest';

import LegendDataLayer from '../../../views/Seedlot/SeedlotMap/LegendDataLayer';
import { SingleTileWmsLeafletLayer } from '../../../views/Seedlot/SeedlotMap/LeafletMap/SingleTileWmsLayer';
import { SeedlotPointsLeafletLayer } from '../../../views/Seedlot/SeedlotMap/SeedlotPointsLayer/seedlotPointsLayer';
import { fetchOverlayLegend } from '../../../api-service/legendApi';

type Handler = (e?: unknown) => void;
const OPENMAPS = 'https://openmaps.gov.bc.ca/geo/pub/wms';

const mapEvents: Record<string, Handler> = {};
let layers: unknown[] = [];
const fakeMap = {
  getBounds: () => L.latLngBounds([48, -124], [49, -123]),
  eachLayer: (fn: (l: unknown) => void) => layers.forEach(fn),
  on: vi.fn((names: string, fn: Handler) => { names.split(' ').forEach((n) => { mapEvents[n] = fn; }); }),
  off: vi.fn()
};
const ctx = { setLegendData: vi.fn() };

vi.mock('react-leaflet', () => ({ useMap: () => fakeMap }));
vi.mock('../../../contexts/SparMapContext', () => ({ useSparMap: () => ctx }));
vi.mock('../../../api-service/seedlotPointsApi', () => ({ fetchSeedlotPoints: vi.fn() }));
vi.mock('../../../api-service/legendApi', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  fetchOverlayLegend: vi.fn()
}));
vi.mock('../../../config/legacy-spar-layers', () => ({
  legacyLayerLabel: (layers: string) => (layers.startsWith('LEGACY') ? 'Legacy label' : undefined),
  speciesLabel: (code: string) => `Species ${code}`
}));
vi.mock('../../../config/bcgw-catalog', () => ({
  BCGW_CATALOG: [{ layerName: 'CATALOG_LAYER', displayName: 'Catalog label' }]
}));
vi.mock('../../../views/Seedlot/SeedlotMap/LeafletMap/SingleTileWmsLayer', () => ({
  SingleTileWmsLeafletLayer: class {
    info: unknown;

    constructor(info: unknown) { this.info = info; }

    getLegendInfo() { return this.info; }
  }
}));

const tileLayer = (layerNames: string, url = OPENMAPS) => ({ wmsParams: { layers: layerNames }, _url: url });
const singleTile = (layerNames: string, inScaleRange = true) => new (SingleTileWmsLeafletLayer as unknown as new (i: unknown) => unknown)({
  url: OPENMAPS, layers: layerNames, styles: '', inScaleRange
});
const pointsLayer = (species: string[]) => {
  const layer = new SeedlotPointsLeafletLayer({ typeName: 't', activeOnly: null, labelText: 'Seedlot' });
  vi.spyOn(layer, 'getRenderedSpecies').mockReturnValue(species);
  return layer;
};
const rule = (label: string) => ({ label, swatch: { geometry: 'polygon' } });
const published = () => ctx.setLegendData.mock.lastCall?.[0];
const settle = () => act(async () => { await vi.advanceTimersByTimeAsync(500); });

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  layers = [];
  Object.keys(mapEvents).forEach((k) => delete mapEvents[k]);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('LegendDataLayer', () => {
  it('publishes an empty legend when no WMS overlay is on', () => {
    render(<LegendDataLayer />);
    expect(published()).toEqual([]);
    expect(fetchOverlayLegend).not.toHaveBeenCalled();
  });

  it('labels overlays from the legacy map, the catalog, then GeoServer', async () => {
    vi.mocked(fetchOverlayLegend).mockImplementation(async (ref) => ({
      title: ref.layers === 'UNKNOWN' ? null : 'GeoServer title',
      rules: [rule('a')]
    }) as never);
    layers = [tileLayer('LEGACY_A'), tileLayer('CATALOG_LAYER'), tileLayer('OTHER'), tileLayer('UNKNOWN')];
    render(<LegendDataLayer />);
    await settle();
    expect(published().map((o: { label: string }) => o.label))
      .toEqual(['Legacy label', 'Catalog label', 'GeoServer title', 'UNKNOWN']);
  });

  it('skips non-openmaps, out-of-scale, duplicate and empty overlays, and failed lookups', async () => {
    vi.mocked(fetchOverlayLegend).mockImplementation(async (ref) => {
      if (ref.layers === 'BROKEN') throw new Error('404');
      return { title: ref.layers, rules: ref.layers === 'EMPTY' ? [] : [rule('a')] } as never;
    });
    layers = [
      tileLayer('KEEP'),
      tileLayer('KEEP'),
      tileLayer('ELSEWHERE', 'https://example.com/wms'),
      singleTile('FAR', false),
      singleTile('SINGLE'),
      tileLayer('EMPTY'),
      tileLayer('BROKEN'),
      { notAWmsLayer: true }
    ];
    render(<LegendDataLayer />);
    await settle();
    expect(fetchOverlayLegend).toHaveBeenCalledTimes(4);
    expect(published().map((o: { id: string }) => o.id)).toEqual(['KEEP', 'SINGLE']);
  });

  it('adds a sorted species key for the seedlot points in view', async () => {
    layers = [pointsLayer(['PLI', 'FDC']), pointsLayer(['FDC'])];
    render(<LegendDataLayer />);
    expect(published()).toEqual([expect.objectContaining({
      id: '__species__',
      rules: [
        expect.objectContaining({ label: 'Species FDC' }),
        expect.objectContaining({ label: 'Species PLI' })
      ]
    })]);
  });

  it('refreshes after moves and relevant layer changes, without republishing the same legend', async () => {
    render(<LegendDataLayer />);
    expect(ctx.setLegendData).toHaveBeenCalledTimes(1);

    mapEvents.layeradd({ layer: { notAWmsLayer: true } });
    mapEvents.moveend();
    await settle();
    expect(ctx.setLegendData).toHaveBeenCalledTimes(1);

    layers = [pointsLayer(['FDC'])];
    mapEvents['spar:pointsrendered']();
    mapEvents.layeradd({ layer: layers[0] });
    await settle();
    expect(ctx.setLegendData).toHaveBeenCalledTimes(2);
  });

  it('drops a slow response that a newer refresh superseded', async () => {
    let resolveFirst: (v: unknown) => void = () => {};
    vi.mocked(fetchOverlayLegend)
      .mockReturnValueOnce(new Promise((r) => { resolveFirst = r; }) as never)
      .mockResolvedValueOnce({ title: 'new', rules: [rule('new')] } as never);
    layers = [tileLayer('A')];
    render(<LegendDataLayer />);
    mapEvents.moveend();
    await settle();
    await act(async () => { resolveFirst({ title: 'old', rules: [rule('old')] }); });
    expect(published()[0].label).toBe('new');
  });

  it('stops listening on unmount', () => {
    const { unmount } = render(<LegendDataLayer />);
    unmount();
    expect(fakeMap.off).toHaveBeenCalledWith('moveend zoomend', expect.any(Function));
    expect(fakeMap.off).toHaveBeenCalledWith('layeradd layerremove', expect.any(Function));
  });
});
