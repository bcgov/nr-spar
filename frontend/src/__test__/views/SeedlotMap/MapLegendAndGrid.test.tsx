import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import L from 'leaflet';
import {
  describe, it, expect, vi, beforeEach
} from 'vitest';

import LegendPanel, { swatchStyle } from '../../../views/Seedlot/SeedlotMap/LegendPanel';
import BecZonePanel from '../../../views/Seedlot/SeedlotMap/BecZonePanel';
import CollapsibleCard from '../../../views/Seedlot/SeedlotMap/CollapsibleCard';
import GraticuleLayer from '../../../views/Seedlot/SeedlotMap/GraticuleLayer';

type Handler = () => void;
const ctx: Record<string, unknown> = {};
const mapEvents: Record<string, Handler> = {};
const fakeMap = {
  zoom: 10,
  bounds: L.latLngBounds([48.2, -124.3], [49.7, -122.6]),
  getZoom() { return this.zoom; },
  getBounds() { return this.bounds; },
  addLayer: vi.fn(),
  removeLayer: vi.fn(),
  on: vi.fn((names: string, fn: Handler) => { names.split(' ').forEach((n) => { mapEvents[n] = fn; }); }),
  off: vi.fn()
};

vi.mock('../../../contexts/SparMapContext', () => ({ useSparMap: () => ctx }));
vi.mock('react-leaflet', () => ({ useMap: () => fakeMap }));

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(ctx).forEach((k) => delete ctx[k]);
  fakeMap.zoom = 10;
});

describe('LegendPanel', () => {
  it('says so when nothing in view has a legend', () => {
    ctx.legendData = [];
    render(<LegendPanel />);
    expect(screen.getByTestId('legend-panel-empty')).toBeInTheDocument();
  });

  it('lists each overlay with its rules', () => {
    ctx.legendData = [{
      id: 'bec',
      label: 'BEC zones',
      rules: [
        { label: 'CWH', swatch: { geometry: 'polygon', fill: '#00ff00', stroke: null } },
        { label: 'Road', swatch: { geometry: 'line', stroke: '#ff0000', strokeWidth: 1 } }
      ]
    }];
    render(<LegendPanel />);
    expect(screen.getAllByTestId('legend-panel-row-bec')).toHaveLength(2);
    expect(screen.getByText('BEC zones')).toBeInTheDocument();
  });

  it('draws line, point and polygon swatches', () => {
    expect(swatchStyle({ geometry: 'line', stroke: null, strokeWidth: 0.5 } as never))
      .toMatchObject({ height: 0, borderTop: '2px solid #161616' });
    expect(swatchStyle({ geometry: 'point', fill: '#123456', stroke: '#000' } as never))
      .toMatchObject({ borderRadius: '50%', backgroundColor: '#123456', border: '1px solid #000' });
    expect(swatchStyle({ geometry: 'polygon', fill: null, stroke: null } as never))
      .toMatchObject({ borderRadius: 2, backgroundColor: 'transparent', border: '1px solid #888888' });
  });
});

describe('BecZonePanel', () => {
  const renderPanel = (url: string) => render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/map/:seedlotNumber" element={<BecZonePanel />} />
        <Route path="/map" element={<BecZonePanel />} />
      </Routes>
    </MemoryRouter>
  );

  beforeEach(() => {
    Object.assign(ctx, {
      becZoneCodes: ['CWHxm1', 'CDFmm'],
      becNotSuit: ['CDFmm'],
      zoomToBecZone: vi.fn().mockResolvedValue(undefined)
    });
  });

  it('lists zones, flags unsuitable ones and zooms to a selected zone', () => {
    renderPanel('/map/60001');
    expect(screen.getByTestId('bec-zone-panel-hint')).toBeInTheDocument();
    expect(screen.getByTestId('bec-zone-panel-lot')).toHaveTextContent('Seedlot Number: 60001');
    expect(screen.getByTestId('bec-zone-row-CDFmm')).toHaveTextContent('CDFmm*');
    fireEvent.click(screen.getByTestId('bec-zone-row-CWHxm1'));
    expect(screen.getByTestId('bec-zone-row-CWHxm1')).toHaveAttribute('aria-pressed', 'true');
    expect(ctx.zoomToBecZone).toHaveBeenCalledWith('CWHxm1');
  });

  it('shows a veg lot from the URL instead of the seedlot', () => {
    ctx.becNotSuit = [];
    renderPanel('/map/60001?veglot=V77');
    expect(screen.getByTestId('bec-zone-panel-lot')).toHaveTextContent('Veglot Number: V77');
    expect(screen.queryByTestId('bec-zone-panel-hint')).not.toBeInTheDocument();
  });

  it('prefers the seedlot query parameter and omits the lot when there is none', () => {
    const { unmount } = renderPanel('/map?seedlot=63001');
    expect(screen.getByTestId('bec-zone-panel-lot')).toHaveTextContent('Seedlot Number: 63001');
    unmount();
    renderPanel('/map');
    expect(screen.queryByTestId('bec-zone-panel-lot')).not.toBeInTheDocument();
  });
});

describe('CollapsibleCard', () => {
  it('opens and closes on its own', () => {
    render(<CollapsibleCard title="Polygon statistics"><p>body</p></CollapsibleCard>);
    expect(screen.queryByText('body')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('card-polygon-statistics-toggle'));
    expect(screen.getByTestId('card-polygon-statistics-body')).toHaveTextContent('body');
  });

  it('follows a controlling parent and reports toggles', () => {
    const onOpenChange = vi.fn();
    render(
      <CollapsibleCard title="Legend" open onOpenChange={onOpenChange}>
        <p>body</p>
      </CollapsibleCard>
    );
    fireEvent.click(screen.getByTestId('card-legend-toggle'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByText('body')).toBeInTheDocument();
  });
});

describe('GraticuleLayer', () => {
  const lines = () => {
    const group = fakeMap.addLayer.mock.calls[0][0] as L.LayerGroup;
    return group.getLayers() as L.Polyline[];
  };
  const labels = () => lines().map((l) => l.getTooltip()!.getContent());

  it('draws nothing while hidden', () => {
    ctx.graticuleVisible = false;
    render(<GraticuleLayer />);
    expect(fakeMap.addLayer).not.toHaveBeenCalled();
    expect(fakeMap.on).not.toHaveBeenCalled();
  });

  it('draws 1° lines with hemisphere labels at mid zoom', () => {
    ctx.graticuleVisible = true;
    render(<GraticuleLayer />);
    expect(labels()).toEqual(expect.arrayContaining(['48° N', '49° N', '124° W', '123° W']));
    expect(labels()).not.toContain('48.5° N');
  });

  it('tightens the spacing when zoomed in, on each move', () => {
    ctx.graticuleVisible = true;
    render(<GraticuleLayer />);
    const coarse = lines().length;
    fakeMap.zoom = 12;
    mapEvents.moveend();
    expect(lines().length).toBeGreaterThan(coarse);
  });

  it('labels the southern and eastern hemispheres and uses wide steps far out', () => {
    ctx.graticuleVisible = true;
    fakeMap.zoom = 3;
    fakeMap.bounds = L.latLngBounds([-40, 100], [10, 160]);
    render(<GraticuleLayer />);
    expect(labels()).toEqual(expect.arrayContaining(['30° S', '120° E']));
    fakeMap.bounds = L.latLngBounds([48.2, -124.3], [49.7, -122.6]);
  });

  it('covers every zoom band', () => {
    ctx.graticuleVisible = true;
    render(<GraticuleLayer />);
    [5, 7, 8, 14].forEach((zoom) => {
      fakeMap.zoom = zoom;
      mapEvents.zoomend();
      expect(lines().length).toBeGreaterThan(0);
    });
  });

  it('removes its lines when unmounted', () => {
    ctx.graticuleVisible = true;
    const { unmount } = render(<GraticuleLayer />);
    unmount();
    expect(fakeMap.removeLayer).toHaveBeenCalled();
    expect(fakeMap.off).toHaveBeenCalledWith('moveend zoomend', expect.any(Function));
  });
});
