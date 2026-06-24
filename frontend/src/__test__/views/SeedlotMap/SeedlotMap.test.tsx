import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import SeedlotMap, { SeedlotMapBody } from '../../../views/Seedlot/SeedlotMap';
import { SparMapProvider, useSparMap } from '../../../contexts/SparMapContext';

// React-Leaflet uses canvas-based tiles which jsdom can't render. Mock it
// (matches the stub used in LeafletMap.test.tsx) because <LeafletMap> is
// rendered transitively by <SeedlotMap>.
vi.mock('react-leaflet', () => {
  const noopMap = {
    pm: {
      addControls: () => {},
      removeControls: () => {},
      enableDraw: () => {},
      disableDraw: () => {},
      enableGlobalEditMode: () => {},
      disableGlobalEditMode: () => {},
      getGeomanLayers: () => []
    },
    on: () => {},
    off: () => {}
  };
  return {
    MapContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="map-container">{children}</div>
    ),
    TileLayer: () => <div data-testid="tile-layer" />,
    WMSTileLayer: () => <div data-testid="wms-tile-layer" />,
    useMap: () => noopMap,
    useMapEvent: () => {},
    GeoJSON: () => <div data-testid="geojson-overlay" />,
    Popup: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="popup">{children}</div>
    )
  };
});

// Mock `<LeafletMap>` itself so tests can use un-registered themes like
// `AOUCBST` / `PLANTSITECBST` without crashing inside `getThemeProfile`.
// The real LeafletMap is still covered by LeafletMap.test.tsx (which only
// mocks react-leaflet, not LeafletMap itself).
vi.mock('../../../views/Seedlot/SeedlotMap/LeafletMap', () => ({
  default: () => <div data-testid="leaflet-map" />
}));

// Leaflet CSS is a static import in LeafletMap — stub the side effect.
vi.mock('leaflet/dist/leaflet.css', () => ({}));

// Geoman is a side-effect import in AoiDrawLayer; jsdom doesn't need it.
vi.mock('@geoman-io/leaflet-geoman-free', () => ({}));
vi.mock('@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css', () => ({}));

const renderAt = (url: string) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/seedlots/map/:seedlotNumber" element={<SeedlotMap />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('SeedlotMap view', () => {
  it('renders the page with the seedlot number from the URL param', () => {
    renderAt('/seedlots/map/12345');
    expect(screen.queryByTestId('seedlot-map-page')).toBeTruthy();
    // The seedlot number appears in the page header and the print header
    expect(screen.getAllByText(/12345/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders the LeafletMap with the read-only default theme when no theme param is given (legacy cwmSparmap.jsp:138 parity)', () => {
    renderAt('/seedlots/map/12345');
    expect(screen.queryByTestId('leaflet-map')).toBeTruthy();
    // Default theme is read-only — neither the AOI toolbar nor the BEC
    // panel should render. Operators have to opt into COLAREA explicitly.
    expect(screen.queryByTestId('aoi-toolbar')).toBeNull();
    expect(screen.queryByTestId('bec-zone-panel')).toBeNull();
  });

  it('renders with an explicit theme URL param', () => {
    renderAt('/seedlots/map/12345?theme=COLAREA');
    expect(screen.queryByTestId('leaflet-map')).toBeTruthy();
  });

  it('renders the AOI toolbar for the COLAREA theme (drawingEnabled)', () => {
    renderAt('/seedlots/map/12345?theme=COLAREA');
    expect(screen.queryByTestId('aoi-toolbar')).toBeTruthy();
    expect(screen.queryByTestId('map-toolbar')).toBeNull();
    expect(screen.queryByTestId('aoi-group-inspect')).toBeTruthy();
    expect(screen.queryByTestId('aoi-group-aoi')).toBeTruthy();
    expect(screen.queryByTestId('aoi-group-files')).toBeTruthy();
    expect(screen.queryByTestId('aoi-group-measure')).toBeTruthy();
    expect(screen.queryByTestId('aoi-group-view')).toBeTruthy();

    fireEvent.click(screen.getByTestId('aoi-group-aoi'));
    expect(screen.queryByTestId('aoi-add-polygon')).toBeTruthy();
    expect(screen.queryByTestId('aoi-edit-polygon')).toBeTruthy();
    expect(screen.queryByTestId('aoi-clear-last')).toBeTruthy();
    expect(screen.queryByTestId('aoi-clear-all')).toBeTruthy();
    expect(screen.queryByTestId('aoi-validate')).toBeTruthy();
    expect(screen.queryByTestId('aoi-submit')).toBeTruthy();

    fireEvent.click(screen.getByTestId('aoi-group-inspect'));
    expect(screen.queryByTestId('aoi-draw-point')).toBeTruthy();

    fireEvent.click(screen.getByTestId('aoi-group-view'));
    expect(screen.queryByTestId('aoi-search')).toBeTruthy();
    expect(screen.queryByTestId('aoi-bookmarks')).toBeTruthy();
    expect(screen.queryByTestId('aoi-cancel')).toBeNull();
  });

  it('disables polygon-dependent buttons when no AOI is drawn (COLAREA)', () => {
    renderAt('/seedlots/map/12345?theme=COLAREA');
    fireEvent.click(screen.getByTestId('aoi-group-aoi'));
    // With no polygons in context, edit/clear/validate/submit should be
    // disabled; Add/Import are always enabled. Import Shape File became
    // enabled in Phase 3 so the user can upload a KML/KMZ/Shapefile even
    // before any manual drawing has happened.
    expect(screen.getByTestId('aoi-edit-polygon').hasAttribute('disabled')).toBe(true);
    expect(screen.getByTestId('aoi-clear-last').hasAttribute('disabled')).toBe(true);
    expect(screen.getByTestId('aoi-clear-all').hasAttribute('disabled')).toBe(true);
    expect(screen.getByTestId('aoi-validate').hasAttribute('disabled')).toBe(true);
    expect(screen.getByTestId('aoi-submit').hasAttribute('disabled')).toBe(true);
    expect(screen.getByTestId('aoi-add-polygon').hasAttribute('disabled')).toBe(false);

    fireEvent.click(screen.getByTestId('aoi-group-files'));
    expect(screen.getByTestId('aoi-import-shape').hasAttribute('disabled')).toBe(false);
  });

  it('parses lowercase beczone param with not-suit suffix into the BEC panel', async () => {
    renderAt('/seedlots/map/12345?theme=AOUCBST&beczone=IDF,MH_,SBS');
    // The BecZonePanel is mounted for the AOUCBST theme.
    expect(await screen.findByTestId('bec-zone-panel')).toBeTruthy();
    expect(screen.queryByText('IDF')).toBeTruthy();
    // Trailing underscore in `MH_` marks it not-suitable → rendered as `MH*`.
    expect(screen.queryByText('MH*')).toBeTruthy();
    expect(screen.queryByText('SBS')).toBeTruthy();
  });

  it('parses camelCase becZone single value into the BEC panel', async () => {
    renderAt('/seedlots/map/12345?theme=PLANTSITECBST&becZone=IDFmw1');
    expect(await screen.findByTestId('bec-zone-panel')).toBeTruthy();
    expect(screen.queryByText('IDFmw1')).toBeTruthy();
  });

  it('prefers lowercase beczone over camelCase becZone when both are present', async () => {
    renderAt('/seedlots/map/12345?theme=AOUCBST&beczone=IDF,MH_&becZone=IDFmw1');
    expect(await screen.findByTestId('bec-zone-panel')).toBeTruthy();
    expect(screen.queryByText('IDF')).toBeTruthy();
    expect(screen.queryByText('MH*')).toBeTruthy();
    // The camelCase value should NOT appear (lowercase wins)
    expect(screen.queryByText('IDFmw1')).toBeNull();
  });

  it('falls back to the "default" theme (read-only) when an unknown theme param is given (legacy cwmSparmap.jsp:138 parity)', () => {
    // bogus theme string — view should default to the read-only theme
    // (NOT COLAREA — the legacy `setUrlParam` fell back to "default" too).
    renderAt('/seedlots/map/12345?theme=nonsense');
    expect(screen.queryByTestId('seedlot-map-page')).toBeTruthy();
    // The BEC panel is NOT shown for the default theme.
    expect(screen.queryByTestId('bec-zone-panel')).toBeNull();
    // The AOI toolbar is also NOT shown — default is read-only.
    expect(screen.queryByTestId('aoi-toolbar')).toBeNull();
    expect(screen.queryByTestId('map-toolbar')).toBeTruthy();
  });

  it('sets becZoneShape="zone" when lowercase beczone= is present', () => {
    let captured: string | undefined;
    const Probe = () => {
      captured = useSparMap().becZoneShape;
      return null;
    };
    render(
      <MemoryRouter initialEntries={['/seedlots/map/12345?theme=AOUCBST&beczone=IDF,SBS']}>
        <Routes>
          <Route path="/seedlots/map/:seedlotNumber" element={
            <SparMapProvider>
              <SeedlotMapBody />
              <Probe />
            </SparMapProvider>
          } />
        </Routes>
      </MemoryRouter>
    );
    expect(captured).toBe('zone');
  });

  it('sets becZoneShape="mapLabel" when camelCase becZone= is present', () => {
    let captured: string | undefined;
    const Probe = () => {
      captured = useSparMap().becZoneShape;
      return null;
    };
    render(
      <MemoryRouter initialEntries={['/seedlots/map/12345?theme=PLANTSITECBST&becZone=IDFmw1']}>
        <Routes>
          <Route path="/seedlots/map/:seedlotNumber" element={
            <SparMapProvider>
              <SeedlotMapBody />
              <Probe />
            </SparMapProvider>
          } />
        </Routes>
      </MemoryRouter>
    );
    expect(captured).toBe('mapLabel');
  });

  // Helper: render <SeedlotMapBody> with a probe component that captures
  // the live context state. <SeedlotMapBody> mounts <AoiToolbar>, which
  // needs a QueryClientProvider for `useAoiSave` (a useMutation call
  // that crashes if no client is in scope).
  const renderWithProbe = (url: string) => {
    let captured: ReturnType<typeof useSparMap> | undefined;
    const Probe = () => {
      captured = useSparMap();
      return null;
    };
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={[url]}>
          <Routes>
            <Route
              path="/seedlots/map/:seedlotNumber"
              element={
                <SparMapProvider>
                  <SeedlotMapBody />
                  <Probe />
                </SparMapProvider>
              }
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
    return () => captured;
  };

  it('reprojects the BC Albers extent URL param into context.extentBounds', () => {
    const get = renderWithProbe(
      '/seedlots/map/12345?theme=COLAREA&extent=1424659.679,567002.918,1434659.679,577002.918'
    );
    const ctx = get();
    expect(ctx?.extentBounds).toBeTruthy();
    const [sw, ne] = ctx!.extentBounds as [[number, number], [number, number]];
    // Centroid lands around (50.0°N, -120.0°W) — south-interior BC.
    expect((sw[0] + ne[0]) / 2).toBeGreaterThan(49.5);
    expect((sw[0] + ne[0]) / 2).toBeLessThan(50.5);
    expect((sw[1] + ne[1]) / 2).toBeGreaterThan(-120.5);
    expect((sw[1] + ne[1]) / 2).toBeLessThan(-119.5);
  });

  it('falls back to null extentBounds when extent= is absent', () => {
    const get = renderWithProbe('/seedlots/map/12345?theme=COLAREA');
    expect(get()?.extentBounds).toBeNull();
  });

  it('clears extentBounds when extent= is malformed', () => {
    const get = renderWithProbe('/seedlots/map/12345?theme=COLAREA&extent=bad');
    expect(get()?.extentBounds).toBeNull();
  });

  it('parses seedlot= URL param into context.seedlotNumber (and clears veglot)', () => {
    const get = renderWithProbe('/seedlots/map/12345?theme=COLAREA&seedlot=04404');
    const ctx = get();
    expect(ctx?.seedlotNumber).toBe('04404');
    expect(ctx?.veglotNumber).toBeNull();
  });

  it('parses veglot= URL param into context.veglotNumber when seedlot= is absent', () => {
    const get = renderWithProbe('/seedlots/map/12345?theme=COLAREA&veglot=99999');
    const ctx = get();
    expect(ctx?.veglotNumber).toBe('99999');
    expect(ctx?.seedlotNumber).toBeNull();
  });

  it('prefers seedlot= over veglot= when both are present (mutual exclusivity)', () => {
    const get = renderWithProbe(
      '/seedlots/map/12345?theme=COLAREA&seedlot=04404&veglot=99999'
    );
    const ctx = get();
    expect(ctx?.seedlotNumber).toBe('04404');
    expect(ctx?.veglotNumber).toBeNull();
  });

  it('parses spzid= CSV into a number array on context.spzIds', () => {
    const get = renderWithProbe('/seedlots/map/12345?theme=COLAREA&spzid=1284,1342,7');
    expect(get()?.spzIds).toEqual([1284, 1342, 7]);
  });

  it('drops blanks and non-integers from spzid= without throwing', () => {
    const get = renderWithProbe('/seedlots/map/12345?theme=COLAREA&spzid=1284,,abc,42');
    expect(get()?.spzIds).toEqual([1284, 42]);
  });

  it('stashes spz= and species= into context for future use without rendering anything', () => {
    const get = renderWithProbe('/seedlots/map/12345?theme=COLAREA&spz=M&species=FDC');
    const ctx = get();
    expect(ctx?.spzCode).toBe('M');
    expect(ctx?.speciesCode).toBe('FDC');
  });
});
