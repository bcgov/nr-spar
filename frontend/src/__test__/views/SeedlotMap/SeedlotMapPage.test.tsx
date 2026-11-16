import React, { forwardRef, useImperativeHandle } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import {
  describe, it, expect, vi, beforeEach
} from 'vitest';

import { SeedlotMapBody } from '../../../views/Seedlot/SeedlotMap';
import LeafletMap from '../../../views/Seedlot/SeedlotMap/LeafletMap';

const ctx: Record<string, unknown> = {};
const fakeMap = { addLayer: vi.fn(), removeLayer: vi.fn(), fitBounds: vi.fn() };
const fakeControl = { addOverlay: vi.fn(), removeLayer: vi.fn() };
let mapContainerProps: Record<string, unknown> = {};

vi.mock('../../../contexts/SparMapContext', () => ({
  useSparMap: () => ctx,
  SparMapProvider: ({ children }: { children: React.ReactNode }) => children
}));
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }: { children: React.ReactNode }) => {
    mapContainerProps = props;
    return <div data-testid="map-container">{children}</div>;
  },
  ZoomControl: () => null,
  AttributionControl: () => null,
  ScaleControl: () => null,
  useMap: () => fakeMap
}));
vi.mock('../../../config/bcgw-catalog', () => ({
  BCGW_CATALOG: [{
    id: 'roads', displayName: 'Roads', wmsUrl: 'https://openmaps.gov.bc.ca/geo/wms', layerName: 'ROADS', format: 'image/png', transparent: true
  }]
}));
vi.mock('../../../views/Seedlot/SeedlotMap/TreeLayersControl', () => ({
  default: forwardRef((_props, ref) => {
    useImperativeHandle(ref, () => fakeControl);
    return null;
  })
}));

type ToolbarProps = {
  onToggleSearch: () => void; onToggleBookmarks: () => void; onToggleMeasureTools: () => void
};

// vi.mock factories are hoisted, so their helpers must be too.
const { stub, toolbarStub } = vi.hoisted(() => ({
  // Child layers and panels have their own tests; stub them here.
  stub: (name: string) => ({ default: () => <div data-testid={`stub-${name}`} /> }),
  toolbarStub: (name: string) => ({
    default: ({ onToggleSearch, onToggleBookmarks, onToggleMeasureTools }: ToolbarProps) => (
      <div data-testid={`stub-${name}`}>
        <button type="button" onClick={onToggleSearch}>toggle search</button>
        <button type="button" onClick={onToggleBookmarks}>toggle bookmarks</button>
        <button type="button" onClick={onToggleMeasureTools}>toggle measure</button>
      </div>
    )
  })
}));
vi.mock('../../../views/Seedlot/SeedlotMap/BecIdentifyLayer', () => stub('identify'));
vi.mock('../../../views/Seedlot/SeedlotMap/BecHighlightLayer', () => stub('bec-highlight'));
vi.mock('../../../views/Seedlot/SeedlotMap/PointHighlightLayer', () => stub('point-highlight'));
vi.mock('../../../views/Seedlot/SeedlotMap/SpzHighlightLayer', () => stub('spz-highlight'));
vi.mock('../../../views/Seedlot/SeedlotMap/AoiDrawLayer', () => stub('aoi-draw'));
vi.mock('../../../views/Seedlot/SeedlotMap/LegendDataLayer', () => stub('legend-data'));
vi.mock('../../../views/Seedlot/SeedlotMap/MeasureControl', () => stub('measure'));
vi.mock('../../../views/Seedlot/SeedlotMap/ViewControl', () => stub('view'));
vi.mock('../../../views/Seedlot/SeedlotMap/MarkupPointLayer', () => stub('markup'));
vi.mock('../../../views/Seedlot/SeedlotMap/GraticuleLayer', () => stub('graticule'));
vi.mock('../../../views/Seedlot/SeedlotMap/CursorPositionControl', () => stub('cursor'));
vi.mock('../../../views/Seedlot/SeedlotMap/GeomCalcPanel', () => stub('geomcalc'));
vi.mock('../../../views/Seedlot/SeedlotMap/LegendPanel', () => stub('legend-panel'));
vi.mock('../../../views/Seedlot/SeedlotMap/MeasurementToolsPanel', () => stub('measure-panel'));
vi.mock('../../../views/Seedlot/SeedlotMap/SearchControl', () => stub('search'));
vi.mock('../../../views/Seedlot/SeedlotMap/BookmarksPanel', () => stub('bookmarks'));
vi.mock('../../../views/Seedlot/SeedlotMap/BecZonePanel', () => stub('bec-panel'));

vi.mock('../../../views/Seedlot/SeedlotMap/AoiToolbar', () => toolbarStub('aoi-toolbar'));
vi.mock('../../../views/Seedlot/SeedlotMap/MapToolbar', () => toolbarStub('map-toolbar'));

const renderPage = (query = '') => render(
  <MemoryRouter initialEntries={[`/map/60001${query}`]}>
    <Routes>
      <Route path="/map/:seedlotNumber" element={<SeedlotMapBody />} />
    </Routes>
  </MemoryRouter>
);

const last = (fn: unknown) => (fn as ReturnType<typeof vi.fn>).mock.lastCall;

beforeEach(() => {
  vi.clearAllMocks();
  mapContainerProps = {};
  Object.keys(ctx).forEach((k) => delete ctx[k]);
  Object.assign(ctx, {
    setBecZones: vi.fn(),
    setExtentBounds: vi.fn(),
    setHighlightPoint: vi.fn(),
    setSpzIds: vi.fn(),
    setSpzCode: vi.fn(),
    setSpeciesCode: vi.fn(),
    extentBounds: null,
    activeCatalogLayers: []
  });
});

describe('SeedlotMapBody URL parameters', () => {
  it('clears every map filter when the URL has none', () => {
    renderPage();
    expect(screen.getByText(/Seed Map — 60001/)).toBeInTheDocument();
    expect(last(ctx.setBecZones)).toEqual([[], [], 'zone']);
    expect(last(ctx.setExtentBounds)).toEqual([null]);
    expect(last(ctx.setHighlightPoint)).toEqual([null, null]);
    expect(last(ctx.setSpzIds)).toEqual([[]]);
    expect(last(ctx.setSpzCode)).toEqual([null]);
    expect(last(ctx.setSpeciesCode)).toEqual([null]);
  });

  it('applies BEC zones, extent, lots, SPZ and species from the URL', () => {
    renderPage('?beczone=CWHxm1,MHmm1&extent=1000000,400000,1100000,500000&seedlot=60001&veglot=V12&spzid=7, 9,x&spz=M&species=FDC');
    expect(last(ctx.setBecZones)![0]).toContain('CWHxm1');
    expect(last(ctx.setBecZones)![2]).toBe('zone');
    expect(last(ctx.setExtentBounds)![0]).toHaveLength(2);
    expect(last(ctx.setHighlightPoint)).toEqual(['60001', 'V12']);
    expect(last(ctx.setSpzIds)).toEqual([[7, 9]]);
    expect(last(ctx.setSpzCode)).toEqual(['M']);
    expect(last(ctx.setSpeciesCode)).toEqual(['FDC']);
  });

  it('highlights a single map label from the camel-case becZone parameter', () => {
    renderPage('?becZone=CWHxm1');
    expect(last(ctx.setBecZones)).toEqual([['CWHxm1'], [], 'mapLabel']);
  });

  it('ignores values that are not safe to put into a CQL filter', () => {
    renderPage(`?seedlot=${encodeURIComponent("1' OR '1'='1")}&spz=${encodeURIComponent('M;DROP')}&species=${encodeURIComponent('F D')}&becZone=${encodeURIComponent("x'")}`);
    expect(last(ctx.setHighlightPoint)).toEqual([null, null]);
    expect(last(ctx.setSpzCode)).toEqual([null]);
    expect(last(ctx.setSpeciesCode)).toEqual([null]);
    expect(last(ctx.setBecZones)).toEqual([[], [], 'mapLabel']);
  });

  it('rejects a malformed extent', () => {
    renderPage('?extent=1,2,3');
    expect(last(ctx.setExtentBounds)).toEqual([null]);
  });
});

describe('SeedlotMapBody layout', () => {
  it('uses the map toolbar on view-only themes, with search shown', () => {
    renderPage('?theme=aoua');
    expect(screen.getByTestId('stub-map-toolbar')).toBeInTheDocument();
    expect(screen.queryByTestId('stub-geomcalc')).not.toBeInTheDocument();
    expect(screen.getByTestId('stub-search')).toBeInTheDocument();
    fireEvent.click(screen.getByText('toggle search'));
    expect(screen.queryByTestId('stub-search')).not.toBeInTheDocument();
  });

  it('uses the AOI toolbar and polygon statistics on the collection area theme', () => {
    renderPage('?theme=COLAREA');
    expect(screen.getByTestId('stub-aoi-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('card-polygon-statistics')).toBeInTheDocument();
  });

  it('falls back to the default theme for an unknown one', () => {
    renderPage('?theme=bogus');
    expect(screen.getByTestId('stub-map-toolbar')).toBeInTheDocument();
  });

  it('shows the BEC zone list on the CBST theme', () => {
    renderPage('?theme=AOUCBST');
    expect(screen.getByTestId('stub-bec-panel')).toBeInTheDocument();
  });

  it('keeps bookmarks and measurement tools from opening on top of each other', () => {
    renderPage();
    fireEvent.click(screen.getByText('toggle bookmarks'));
    expect(screen.getByTestId('stub-bookmarks')).toBeInTheDocument();
    fireEvent.click(screen.getByText('toggle measure'));
    expect(screen.getByTestId('stub-measure-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('stub-bookmarks')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Close measurement tools'));
    expect(screen.queryByTestId('stub-measure-panel')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('toggle bookmarks'));
    fireEvent.click(screen.getByLabelText('Close bookmarks'));
    expect(screen.queryByTestId('stub-bookmarks')).not.toBeInTheDocument();
  });

  it('opens and closes the legend', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Map legend' }));
    expect(screen.getByTestId('stub-legend-panel')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Close legend'));
    expect(screen.queryByTestId('stub-legend-panel')).not.toBeInTheDocument();
  });
});

describe('LeafletMap', () => {
  it('opens at the theme zoom, and only mounts drawing on drawing themes', () => {
    const { unmount } = render(<LeafletMap theme="aoua" />);
    expect(mapContainerProps).toMatchObject({ zoom: 8 });
    expect(mapContainerProps.center).toHaveLength(2);
    expect(screen.queryByTestId('stub-aoi-draw')).not.toBeInTheDocument();
    unmount();
    render(<LeafletMap theme="COLAREA" />);
    expect(screen.getByTestId('stub-aoi-draw')).toBeInTheDocument();
  });

  it('opens at, and refits to, an extent from the URL', () => {
    const bounds = [[48, -124], [49, -123]];
    ctx.extentBounds = bounds;
    render(<LeafletMap theme="aoua" />);
    expect(mapContainerProps).toMatchObject({ bounds });
    expect(fakeMap.fitBounds).toHaveBeenCalledWith(bounds, { animate: false });
  });

  it('adds and removes DataBC catalog layers as they are toggled', () => {
    ctx.activeCatalogLayers = ['roads', 'not-in-catalog'];
    const { rerender, unmount } = render(<LeafletMap theme="aoua" />);
    expect(fakeControl.addOverlay).toHaveBeenCalledWith(expect.anything(), 'Roads');
    expect(fakeMap.addLayer).toHaveBeenCalledTimes(1);

    ctx.activeCatalogLayers = [];
    rerender(<LeafletMap theme="aoua" />);
    expect(fakeMap.removeLayer).toHaveBeenCalledTimes(1);
    expect(fakeControl.removeLayer).toHaveBeenCalledTimes(1);

    ctx.activeCatalogLayers = ['roads'];
    rerender(<LeafletMap theme="aoua" />);
    unmount();
    expect(fakeMap.removeLayer).toHaveBeenCalledTimes(2);
  });
});
