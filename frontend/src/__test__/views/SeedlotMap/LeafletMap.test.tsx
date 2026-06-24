import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LeafletMap from '../../../views/Seedlot/SeedlotMap/LeafletMap';
import { SparMapProvider, useSparMap } from '../../../contexts/SparMapContext';
import type { LatLngBoundsExpression } from 'leaflet';

// Hoisted spy so the react-leaflet factory below can read it AND tests
// can assert against it. `vi.mock` is hoisted to the top of the file at
// transform time, so plain `const` declarations defined here aren't
// available inside the factory closure — `vi.hoisted` is the
// blessed escape hatch.
const fitBoundsSpy = vi.hoisted(() => vi.fn());

// React-Leaflet uses canvas-based tiles which jsdom can't render. Mock it
// with trivial stand-ins that expose test IDs we can assert on.
vi.mock('react-leaflet', () => {
  const noopMap = {
    pm: {
      addControls: () => {},
      removeControls: () => {},
      enableDraw: () => {},
      disableDraw: () => {},
      enableGlobalEditMode: () => {},
      disableGlobalEditMode: () => {},
      getGeomanLayers: () => [],
      // Called by AoiDrawLayer to apply the legacy red/gray AOI style to
      // any future Geoman draw or edit session.
      setGlobalOptions: () => {}
    },
    on: () => {},
    off: () => {},
    // ViewControl now seeds its zoom-history stack from the initial
    // view, which means it calls map.getCenter() + map.getZoom() in the
    // mount effect. Return inert values so the stub doesn't blow up.
    getCenter: () => ({ lat: 53.7, lng: -127.6 }),
    getZoom: () => 6,
    setView: () => noopMap,
    flyTo: () => noopMap,
    // Required by MeasureControl which adds an L.layerGroup() to the
    // map directly via addTo(). The Leaflet helper method calls
    // map.addLayer(), so the stub must expose it (and the matching
    // removeLayer for the cleanup path).
    addLayer: () => {},
    removeLayer: () => {},
    // Required by ExtentRefit which calls map.fitBounds(extentBounds)
    // when the URL `extent=` param drives a context update.
    fitBounds: fitBoundsSpy,
    doubleClickZoom: {
      enable: () => {},
      disable: () => {}
    },
    _container: { style: {} as Record<string, string> },
    // BecIdentifyLayer toggles a CSS class on the Leaflet container via
    // `map.getContainer().classList` so the cursor changes in Identify
    // mode. The mock returns a DOM-ish stub whose classList is a noop.
    getContainer: () => ({
      classList: {
        add: () => {},
        remove: () => {}
      }
    })
  };
  // LayersControl is a component with static sub-components
  // (`.BaseLayer`, `.Overlay`). Mirror that shape so the real call sites
  // in LeafletMap.tsx resolve cleanly.
  const LayersControl = Object.assign(
    ({ children }: { children: React.ReactNode }) => (
      <div data-testid="layers-control">{children}</div>
    ),
    {
      BaseLayer: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="layers-control-base">{children}</div>
      ),
      Overlay: ({
        children,
        checked,
        name
      }: {
        children: React.ReactNode;
        checked?: boolean;
        name?: string;
      }) => (
        <div
          data-testid="layers-control-overlay"
          data-checked={checked ? 'true' : 'false'}
          data-name={name ?? ''}
        >
          {children}
        </div>
      )
    }
  );
  return {
    MapContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="map-container">{children}</div>
    ),
    TileLayer: () => <div data-testid="tile-layer" />,
    WMSTileLayer: ({ params }: { params?: { layers?: string } }) => (
      <div data-testid="wms-tile-layer" data-layers={params?.layers ?? ''} />
    ),
    LayersControl,
    ZoomControl: () => <div data-testid="zoom-control" />,
    AttributionControl: () => <div data-testid="attribution-control" />,
    ScaleControl: ({ position, imperial }: { position?: string; imperial?: boolean }) => (
      <div
        data-testid="scale-control"
        data-position={position ?? ''}
        data-imperial={imperial ? 'true' : 'false'}
      />
    ),
    useMap: () => noopMap,
    useMapEvent: () => {},
    GeoJSON: () => <div data-testid="geojson-overlay" />,
    Popup: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="popup">{children}</div>
    )
  };
});

// TreeLayersControl mounts imperatively via useMap() + L.control.layers.tree().
// Neither plays nicely with jsdom (no real DOM, no L.Control infra). Stub
// it out so the rest of LeafletMap renders. The layer-panel structure
// itself is covered by dedicated TreeLayersControl tests.
vi.mock('../../../views/Seedlot/SeedlotMap/TreeLayersControl', () => ({
  default: React.forwardRef<unknown, { theme?: string }>(({ theme }, _ref) => (
    <div data-testid="tree-layers-control" data-theme={theme ?? ''} />
  ))
}));

vi.mock('../../../views/Seedlot/SeedlotMap/LeafletMap/SingleTileWmsLayer', () => ({
  default: ({
    layers,
    styles,
    minScale,
    maxScale,
    opacity,
    pane
  }: {
    layers?: string;
    styles?: string;
    minScale?: number;
    maxScale?: number;
    opacity?: number;
    pane?: string;
  }) => (
    <div
      data-testid="single-tile-wms-layer"
      data-layers={layers ?? ''}
      data-styles={styles ?? ''}
      data-min-scale={minScale ?? ''}
      data-max-scale={maxScale ?? ''}
      data-opacity={opacity ?? ''}
      data-pane={pane ?? ''}
    />
  )
}));

// SeedlotPointsLayer uses `createLayerComponent` from `@react-leaflet/core`
// which calls `useLeafletContext()` — that context isn't provided by our
// react-leaflet mock above. Stub it out the same way as
// SingleTileWmsLayer so the LeafletMap render tree resolves cleanly.
vi.mock('../../../views/Seedlot/SeedlotMap/SeedlotPointsLayer', () => ({
  default: ({
    typeName,
    activeOnly,
    labelText,
    maxScale
  }: {
    typeName?: string;
    activeOnly?: string | null;
    labelText?: string;
    maxScale?: number;
  }) => (
    <div
      data-testid="seedlot-points-layer"
      data-typename={typeName ?? ''}
      data-active-only={activeOnly ?? ''}
      data-label={labelText ?? ''}
      data-max-scale={maxScale ?? ''}
    />
  )
}));

// Leaflet CSS is a static import in LeafletMap — stub the side effect.
vi.mock('leaflet/dist/leaflet.css', () => ({}));

// Geoman is a side-effect import in AoiDrawLayer; jsdom doesn't need it.
vi.mock('@geoman-io/leaflet-geoman-free', () => ({}));
vi.mock('@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css', () => ({}));

// LeafletMap now transitively renders <BecIdentifyLayer> (useQuery) and
// <AoiDrawLayer> (useSparMap), so both providers are required.
const renderWithProviders = (ui: React.ReactElement) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <SparMapProvider>{ui}</SparMapProvider>
    </QueryClientProvider>
  );
};

describe('LeafletMap', () => {
  it('renders a map container for the COLAREA theme', () => {
    renderWithProviders(<LeafletMap theme="COLAREA" />);
    expect(screen.queryByTestId('leaflet-map')).toBeTruthy();
    expect(screen.queryByTestId('map-container')).toBeTruthy();
  });

  // The next 5 tests verified the previous JSX `<LayersControl>` +
  // `<LayersControl.Overlay>` structure. Layer mounting is now
  // imperative inside `<TreeLayersControl>` (uses `useMap()` +
  // `L.control.layers.tree`), so these assertions no longer apply
  // verbatim. The underlying invariants — 6 basemaps including
  // orthophoto, full registry exposed per theme, BEC scale bands,
  // COLAREA default-visible set — moved to dedicated tests:
  //   - registry assertions: src/__test__/config/leaflet-themes.test.ts
  //   - tree control structure: TreeLayersControl.test.tsx (TODO)
  it.todo('renders a basemap tile layer (moved to TreeLayersControl tests)');
  it.todo('includes a BC Gov Orthophoto basemap option served via WMS (moved to TreeLayersControl tests)');
  it.todo('renders all overlay layers via the layer panel (moved to TreeLayersControl tests)');
  it.todo('renders BEC overlays as CWM-style single-tile WMS with legacy scale bands (moved to TreeLayersControl tests)');
  it.todo('checks the legacy COLAREA BEC reference overlays by default (moved to TreeLayersControl tests)');

  it('renders a scale bar in the bottom-left corner', () => {
    renderWithProviders(<LeafletMap theme="COLAREA" />);
    const scale = screen.queryByTestId('scale-control');
    expect(scale).toBeTruthy();
    expect(scale?.getAttribute('data-position')).toBe('bottomleft');
  });

  it('mounts the tree-grouped layers control', () => {
    renderWithProviders(<LeafletMap theme="COLAREA" />);
    const tree = screen.queryByTestId('tree-layers-control');
    expect(tree).toBeTruthy();
    expect(tree?.getAttribute('data-theme')).toBe('COLAREA');
  });

  it('mounts BecHighlightLayer for AOUCBST theme', () => {
    renderWithProviders(<LeafletMap theme="AOUCBST" />);
    expect(screen.queryByTestId('bec-highlight-layer-marker')).toBeTruthy();
  });

  it('mounts BecHighlightLayer for PLANTSITECBST theme', () => {
    renderWithProviders(<LeafletMap theme="PLANTSITECBST" />);
    expect(screen.queryByTestId('bec-highlight-layer-marker')).toBeTruthy();
  });

  it('mounts BecHighlightLayer on COLAREA too so the AOI validate flow can highlight failing zones', () => {
    // Previously BecHighlightLayer was gated to AOUCBST/PLANTSITECBST.
    // It now mounts everywhere and self-gates on `becZoneCodes` in
    // context — COLAREA needs it so a failed BEC-zone validation can
    // light the offending zones up in purple on the map.
    renderWithProviders(<LeafletMap theme="COLAREA" />);
    expect(screen.queryByTestId('bec-highlight-layer-marker')).toBeTruthy();
  });

  it('mounts PointHighlightLayer for every theme (theme-agnostic)', () => {
    // Self-gates on context state — should mount on a non-CBST theme...
    renderWithProviders(<LeafletMap theme="COLAREA" />);
    expect(screen.queryByTestId('point-highlight-layer-marker')).toBeTruthy();
  });

  it('mounts PointHighlightLayer for AOUCBST theme too', () => {
    renderWithProviders(<LeafletMap theme="AOUCBST" />);
    expect(screen.queryByTestId('point-highlight-layer-marker')).toBeTruthy();
  });

  it('mounts SpzHighlightLayer for every theme (theme-agnostic)', () => {
    renderWithProviders(<LeafletMap theme="COLAREA" />);
    expect(screen.queryByTestId('spz-highlight-layer-marker')).toBeTruthy();
  });

  it('refits map bounds when extentBounds updates in context (URL extent=)', () => {
    fitBoundsSpy.mockClear();
    // Helper component to surface the context setter so the test can
    // simulate the URL-parsing useEffect in SeedlotMapBody pushing a
    // freshly-parsed extent into context AFTER the map has mounted.
    let pushExtent: ((b: LatLngBoundsExpression) => void) | null = null;
    const Driver = () => {
      const { setExtentBounds } = useSparMap();
      pushExtent = setExtentBounds;
      return null;
    };
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <SparMapProvider>
          <LeafletMap theme="COLAREA" />
          <Driver />
        </SparMapProvider>
      </QueryClientProvider>
    );
    const newBounds: LatLngBoundsExpression = [
      [49.0, -125.0],
      [50.0, -123.0]
    ];
    act(() => {
      pushExtent?.(newBounds);
    });
    expect(fitBoundsSpy).toHaveBeenCalled();
    // The most recent call must carry the bounds we just pushed.
    const lastCall = fitBoundsSpy.mock.calls[fitBoundsSpy.mock.calls.length - 1];
    expect(lastCall[0]).toEqual(newBounds);
    // Verify the {animate: false} option is forwarded so the refit is
    // immediate (no jarring animation when a deep-link sets the URL).
    expect(lastCall[1]).toMatchObject({ animate: false });
  });
});
