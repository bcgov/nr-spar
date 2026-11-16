import React from 'react';
import { render, waitFor } from '@testing-library/react';
import L from 'leaflet';
import {
  describe, it, expect, vi, beforeEach
} from 'vitest';

import { SingleTileWmsLeafletLayer } from '../../../views/Seedlot/SeedlotMap/LeafletMap/SingleTileWmsLayer';
import BecHighlightLayer from '../../../views/Seedlot/SeedlotMap/BecHighlightLayer';
import PointHighlightLayer from '../../../views/Seedlot/SeedlotMap/PointHighlightLayer';
import SpzHighlightLayer from '../../../views/Seedlot/SeedlotMap/SpzHighlightLayer';
import { fetchBecZoneByMapLabel } from '../../../api-service/becZonesApi';

type Handler = () => void;
const mapEvents: Record<string, Handler> = {};
const fakeMap = {
  zoom: 12,
  getZoom() { return this.zoom; },
  getBounds: () => L.latLngBounds([48, -124], [49, -123]),
  getSize: () => L.point(800.4, 600),
  addLayer: vi.fn(),
  removeLayer: vi.fn(),
  fitBounds: vi.fn(),
  // Like Leaflet, call the handler with the context passed to `on`.
  on: vi.fn((names: string, fn: Handler, context?: unknown) => {
    names.split(' ').forEach((n) => { mapEvents[n] = () => fn.call(context); });
  }),
  off: vi.fn()
};
const ctx: Record<string, unknown> = {};

vi.mock('react-leaflet', () => ({ useMap: () => fakeMap }));
vi.mock('../../../contexts/SparMapContext', () => ({ useSparMap: () => ctx }));
vi.mock('../../../api-service/becZonesApi', () => ({ fetchBecZoneByMapLabel: vi.fn() }));

const added = () => fakeMap.addLayer.mock.calls.map(([l]) => l);
const overlayUrl = (overlay: unknown) => new URL((overlay as { _url: string })._url);
const wmsLayers = () => added().map((l) => (l as L.TileLayer.WMS).wmsParams);

beforeEach(() => {
  vi.clearAllMocks();
  fakeMap.zoom = 12;
  Object.keys(ctx).forEach((k) => delete ctx[k]);
});

describe('SingleTileWmsLeafletLayer', () => {
  const layer = (opts: Record<string, unknown> = {}) => new SingleTileWmsLeafletLayer({
    url: 'https://openmaps.gov.bc.ca/geo/wms', layers: 'BEC', ...opts
  });

  it('requests one image for the whole viewport in Web Mercator', () => {
    const l = layer({ opacity: 0.5 });
    l.onAdd(fakeMap as unknown as L.Map);
    const url = overlayUrl(added()[0]);
    expect(url.searchParams.get('request')).toBe('GetMap');
    expect(url.searchParams.get('srs')).toBe('EPSG:3857');
    expect(url.searchParams.get('width')).toBe('800');
    expect(url.searchParams.get('format')).toBe('image/png');
    expect(url.searchParams.get('transparent')).toBe('true');
    expect(url.searchParams.get('bbox')!.split(',')).toHaveLength(4);
    expect(l.getLegendInfo()).toEqual({
      url: 'https://openmaps.gov.bc.ca/geo/wms', layers: 'BEC', styles: undefined, inScaleRange: true
    });
  });

  it('reloads the image when the map moves', () => {
    const l = layer();
    l.onAdd(fakeMap as unknown as L.Map);
    mapEvents.moveend();
    expect(fakeMap.addLayer).toHaveBeenCalledTimes(2);
  });

  it('hides outside its scale range', () => {
    const tooFar = layer({ maxScale: 100_000 });
    fakeMap.zoom = 5;
    tooFar.onAdd(fakeMap as unknown as L.Map);
    expect(fakeMap.addLayer).not.toHaveBeenCalled();
    expect(tooFar.getLegendInfo().inScaleRange).toBe(false);

    const tooClose = layer({ minScale: 1_000_000 });
    fakeMap.zoom = 15;
    tooClose.onAdd(fakeMap as unknown as L.Map);
    expect(fakeMap.addLayer).not.toHaveBeenCalled();
  });

  it('applies new options and reports out of range once removed', () => {
    const l = layer();
    l.onAdd(fakeMap as unknown as L.Map);
    l.setWmsOptions({
      url: 'https://openmaps.gov.bc.ca/geo/wms', layers: 'SPZ', styles: 's1', format: 'image/jpeg', transparent: false
    });
    const url = overlayUrl(added()[1]);
    expect(url.searchParams.get('layers')).toBe('SPZ');
    expect(url.searchParams.get('transparent')).toBe('false');
    l.onRemove(fakeMap as unknown as L.Map);
    expect(fakeMap.off).toHaveBeenCalledWith('moveend zoomend resize', expect.any(Function), l);
    expect(l.getLegendInfo().inScaleRange).toBe(false);
  });
});

describe('BecHighlightLayer', () => {
  beforeEach(() => {
    Object.assign(ctx, {
      becZoneCodes: [], becNotSuit: [], becZoneShape: 'zone', setBecZones: vi.fn(), _setMapControls: vi.fn()
    });
  });

  it('draws suitable and unsuitable zones as separate layers and replaces them on change', () => {
    ctx.becZoneCodes = ['CWH', 'MH', 'CDF'];
    ctx.becNotSuit = ['MH'];
    const { rerender } = render(<BecHighlightLayer />);
    expect(added()).toHaveLength(2);
    ctx.becZoneCodes = ['CWH'];
    ctx.becNotSuit = [];
    rerender(<BecHighlightLayer />);
    expect(fakeMap.removeLayer).toHaveBeenCalledTimes(2);
    expect(added()).toHaveLength(3);
  });

  it('draws nothing without zones', () => {
    render(<BecHighlightLayer />);
    expect(fakeMap.addLayer).not.toHaveBeenCalled();
  });

  it('zooms to a zone and highlights it', async () => {
    vi.mocked(fetchBecZoneByMapLabel).mockResolvedValue({
      type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[[-123, 49], [-122, 49], [-122, 50], [-123, 49]]] }
    } as never);
    render(<BecHighlightLayer />);
    const { zoomToBecZone } = (ctx._setMapControls as ReturnType<typeof vi.fn>).mock.calls[0][0];
    await zoomToBecZone('CWHxm1');
    expect(fakeMap.fitBounds).toHaveBeenCalled();
    expect(ctx.setBecZones).toHaveBeenCalledWith(['CWHxm1'], [], 'mapLabel');
  });

  it('does nothing for a zone it cannot find, and unregisters on unmount', async () => {
    vi.mocked(fetchBecZoneByMapLabel).mockResolvedValue(null as never);
    const { unmount } = render(<BecHighlightLayer />);
    const { zoomToBecZone } = (ctx._setMapControls as ReturnType<typeof vi.fn>).mock.calls[0][0];
    await zoomToBecZone('NOPE');
    expect(ctx.setBecZones).not.toHaveBeenCalled();
    unmount();
    await waitFor(() => expect(ctx._setMapControls).toHaveBeenLastCalledWith({ zoomToBecZone: null }));
  });
});

describe('PointHighlightLayer', () => {
  it('highlights the seedlot, or the veg lot when there is no seedlot', () => {
    Object.assign(ctx, { seedlotNumber: '60001', veglotNumber: null });
    const { rerender, unmount } = render(<PointHighlightLayer />);
    expect(JSON.stringify(wmsLayers()[0])).toContain('60001');
    Object.assign(ctx, { seedlotNumber: null, veglotNumber: 'V12' });
    rerender(<PointHighlightLayer />);
    expect(JSON.stringify(wmsLayers()[1])).toContain('V12');
    unmount();
    expect(fakeMap.removeLayer).toHaveBeenCalledTimes(2);
  });

  it('draws nothing without a lot', () => {
    Object.assign(ctx, { seedlotNumber: null, veglotNumber: null });
    render(<PointHighlightLayer />);
    expect(fakeMap.addLayer).not.toHaveBeenCalled();
  });
});

describe('SpzHighlightLayer', () => {
  it('highlights the seed plan zones and clears them when the list empties', () => {
    ctx.spzIds = [7, 9];
    const { rerender } = render(<SpzHighlightLayer />);
    expect(JSON.stringify(wmsLayers()[0])).toMatch(/7.*9/);
    ctx.spzIds = [];
    rerender(<SpzHighlightLayer />);
    expect(fakeMap.removeLayer).toHaveBeenCalledTimes(1);
    expect(fakeMap.addLayer).toHaveBeenCalledTimes(1);
  });
});
