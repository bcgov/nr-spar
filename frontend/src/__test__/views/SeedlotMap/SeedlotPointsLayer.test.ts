import L from 'leaflet';
import {
  describe, it, expect, vi, beforeEach, afterEach
} from 'vitest';

import { SeedlotPointsLeafletLayer } from '../../../views/Seedlot/SeedlotMap/SeedlotPointsLayer/seedlotPointsLayer';
import { fetchSeedlotPoints } from '../../../api-service/seedlotPointsApi';

vi.mock('../../../api-service/seedlotPointsApi', () => ({ fetchSeedlotPoints: vi.fn() }));

const makeMap = (zoom = 12) => {
  const listeners: Record<string, () => void> = {};
  return {
    zoom,
    listeners,
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    fire: vi.fn(),
    on: vi.fn((names: string, fn: () => void) => { names.split(' ').forEach((n) => { listeners[n] = fn; }); }),
    off: vi.fn(),
    getZoom() { return this.zoom; },
    getBounds: () => L.latLngBounds([48, -124], [49, -123])
  };
};

const options = () => ({
  typeName: 'pub:SEED_SEEDLOT_POINT_MVW',
  activeOnly: 'YES' as const,
  labelText: 'Seedlot',
  maxScale: 198000,
  speciesCode: null
});

const flush = async () => {
  await vi.advanceTimersByTimeAsync(300);
};

const markers = (layer: SeedlotPointsLeafletLayer) => layer.getLayers() as L.CircleMarker[];

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('SeedlotPointsLeafletLayer', () => {
  it('fetches the viewport after a debounce and colours markers by species', async () => {
    vi.mocked(fetchSeedlotPoints).mockResolvedValue([
      {
        lat: 48.5, lng: -123.5, lotNumber: '60001', vegetationCode: 'fdc', bcgZone: 'CWH', activeIndicator: 'YES'
      },
      {
        lat: 48.6, lng: -123.6, lotNumber: '60002', vegetationCode: 'PLI', bcgZone: null, activeIndicator: 'NO'
      },
      {
        lat: 48.7, lng: -123.7, lotNumber: '60003', vegetationCode: null, bcgZone: null, activeIndicator: null
      }
    ] as never);
    const map = makeMap();
    const layer = new SeedlotPointsLeafletLayer(options());
    layer.onAdd(map as unknown as L.Map);
    expect(fetchSeedlotPoints).not.toHaveBeenCalled();
    await flush();

    expect(fetchSeedlotPoints).toHaveBeenCalledWith(
      'pub:SEED_SEEDLOT_POINT_MVW',
      {
        south: 48, west: -124, north: 49, east: -123
      },
      'YES',
      null
    );
    expect(markers(layer)).toHaveLength(3);
    expect(layer.getRenderedSpecies()).toEqual(['FDC', 'PLI']);
    expect(map.fire).toHaveBeenCalledWith('spar:pointsrendered');
  });

  it('builds popups from text, never parsing attributes as HTML', async () => {
    vi.mocked(fetchSeedlotPoints).mockResolvedValue([{
      lat: 48.5, lng: -123.5, lotNumber: '<img src=x onerror=alert(1)>', vegetationCode: 'FDC', bcgZone: 'CWH', activeIndicator: 'NO'
    }] as never);
    const layer = new SeedlotPointsLeafletLayer(options());
    layer.onAdd(makeMap() as unknown as L.Map);
    await flush();
    const content = markers(layer)[0].getPopup()!.getContent() as HTMLElement;
    expect(content.querySelector('img')).toBeNull();
    expect(content.textContent).toContain('Seedlot <img src=x onerror=alert(1)>');
    expect(content.textContent).toContain('Status: Expired');
    expect(content.textContent).toContain('BEC: CWH');
  });

  it('hides and skips the fetch when zoomed out past the max scale', async () => {
    const map = makeMap(5);
    const layer = new SeedlotPointsLeafletLayer(options());
    layer.onAdd(map as unknown as L.Map);
    await flush();
    expect(fetchSeedlotPoints).not.toHaveBeenCalled();
    expect(layer.getRenderedSpecies()).toEqual([]);
  });

  it('refetches on map moves, collapsing rapid moves into one request', async () => {
    vi.mocked(fetchSeedlotPoints).mockResolvedValue([] as never);
    const map = makeMap();
    const layer = new SeedlotPointsLeafletLayer({ ...options(), maxScale: undefined });
    layer.onAdd(map as unknown as L.Map);
    await flush();
    map.listeners.moveend();
    map.listeners.zoomend();
    map.listeners.moveend();
    await flush();
    expect(fetchSeedlotPoints).toHaveBeenCalledTimes(2);
  });

  it('keeps the current markers when a fetch fails', async () => {
    vi.mocked(fetchSeedlotPoints)
      .mockResolvedValueOnce([{ lat: 48.5, lng: -123.5, lotNumber: '1', vegetationCode: 'FDC' }] as never)
      .mockRejectedValueOnce(new Error('WFS timeout'));
    const map = makeMap();
    const layer = new SeedlotPointsLeafletLayer(options());
    layer.onAdd(map as unknown as L.Map);
    await flush();
    map.listeners.moveend();
    await flush();
    expect(markers(layer)).toHaveLength(1);
  });

  it('applies new options, filtering by species', async () => {
    vi.mocked(fetchSeedlotPoints).mockResolvedValue([] as never);
    const layer = new SeedlotPointsLeafletLayer(options());
    layer.onAdd(makeMap() as unknown as L.Map);
    layer.setLayerOptions({ ...options(), labelText: 'Veg Lot', speciesCode: 'PLI' });
    await flush();
    expect(fetchSeedlotPoints).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fetchSeedlotPoints).mock.calls[0][3]).toBe('PLI');
  });

  it('stops listening, cancels a pending fetch and clears species on removal', async () => {
    const map = makeMap();
    const layer = new SeedlotPointsLeafletLayer(options());
    layer.onAdd(map as unknown as L.Map);
    layer.onRemove(map as unknown as L.Map);
    await flush();
    expect(fetchSeedlotPoints).not.toHaveBeenCalled();
    expect(map.off).toHaveBeenCalledWith('moveend zoomend', expect.any(Function), layer);
    expect(layer.getRenderedSpecies()).toEqual([]);
  });
});
