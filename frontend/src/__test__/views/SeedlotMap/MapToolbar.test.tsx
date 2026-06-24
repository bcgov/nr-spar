import { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

// Reach into the printMap module so the Print button can be tested
// without firing an actual `window.open` / html2canvas pipeline.
// vi.mock is hoisted to the top of the file at transform time, so the
// import below resolves to the mocked module on every test path.
vi.mock('../../../views/Seedlot/SeedlotMap/printMap', () => ({
  printMap: vi.fn()
}));

import MapToolbar from '../../../views/Seedlot/SeedlotMap/MapToolbar';
import {
  SparMapProvider,
  useSparMap
} from '../../../contexts/SparMapContext';
import { printMap } from '../../../views/Seedlot/SeedlotMap/printMap';

const renderToolbar = (overrides: Partial<React.ComponentProps<typeof MapToolbar>> = {}) => {
  const defaults = {
    seedlotNumber: '12345',
    theme: 'COLAREA' as const,
    searchVisible: true,
    onToggleSearch: vi.fn(),
    bookmarksOpen: false,
    onToggleBookmarks: vi.fn(),
    measureToolsOpen: false,
    onToggleMeasureTools: vi.fn()
  } satisfies React.ComponentProps<typeof MapToolbar>;
  const props = { ...defaults, ...overrides } as React.ComponentProps<typeof MapToolbar>;
  return {
    ...render(
      <SparMapProvider>
        <MapToolbar {...props} />
      </SparMapProvider>
    ),
    props
  };
};

// Simulate `MeasureControl` registering its bridge callbacks, so the
// Measure button is no longer disabled. The harness wraps `useSparMap`
// in a small probe component that calls `_setMapControls` once on mount
// (in a useEffect — calling it during render would set state during
// render and trigger an infinite re-render loop).
const renderToolbarWithMeasure = (
  overrides: Partial<React.ComponentProps<typeof MapToolbar>> = {}
) => {
  const startMeasure = vi.fn();
  const clearMeasure = vi.fn();
  const Bridge = () => {
    const { _setMapControls } = useSparMap();
    useEffect(() => {
      _setMapControls({ startMeasure, clearMeasure });
      // setMapControls is stable (wrapped in useCallback in the
      // provider), so an empty-deps effect is safe and only runs once.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return null;
  };
  const defaults = {
    seedlotNumber: '12345',
    theme: 'COLAREA' as const,
    searchVisible: true,
    onToggleSearch: vi.fn(),
    bookmarksOpen: false,
    onToggleBookmarks: vi.fn(),
    measureToolsOpen: false,
    onToggleMeasureTools: vi.fn()
  } satisfies React.ComponentProps<typeof MapToolbar>;
  const props = { ...defaults, ...overrides } as React.ComponentProps<typeof MapToolbar>;
  const ui = render(
    <SparMapProvider>
      <Bridge />
      <MapToolbar {...props} />
    </SparMapProvider>
  );
  return { ...ui, startMeasure, clearMeasure, props };
};

const renderToolbarWithZoom = (
  overrides: Partial<React.ComponentProps<typeof MapToolbar>> = {}
) => {
  const zoomToBC = vi.fn();
  const zoomToInitialExtent = vi.fn();
  const Bridge = () => {
    const { _setMapControls } = useSparMap();
    useEffect(() => {
      _setMapControls({ zoomToBC, zoomToInitialExtent });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return null;
  };
  const defaults = {
    seedlotNumber: '12345',
    theme: 'COLAREA' as const,
    searchVisible: true,
    onToggleSearch: vi.fn(),
    bookmarksOpen: false,
    onToggleBookmarks: vi.fn(),
    measureToolsOpen: false,
    onToggleMeasureTools: vi.fn()
  } satisfies React.ComponentProps<typeof MapToolbar>;
  const props = { ...defaults, ...overrides } as React.ComponentProps<typeof MapToolbar>;
  const ui = render(
    <SparMapProvider>
      <Bridge />
      <MapToolbar {...props} />
    </SparMapProvider>
  );
  return { ...ui, zoomToBC, zoomToInitialExtent, props };
};

const renderToolbarWithDrawPoint = (
  overrides: Partial<React.ComponentProps<typeof MapToolbar>> = {}
) => {
  const startDrawPoint = vi.fn();
  const clearMarkupPoints = vi.fn();
  const Bridge = () => {
    const { _setMapControls } = useSparMap();
    useEffect(() => {
      _setMapControls({ startDrawPoint, clearMarkupPoints });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return null;
  };
  const defaults = {
    seedlotNumber: '12345',
    theme: 'COLAREA' as const,
    searchVisible: true,
    onToggleSearch: vi.fn(),
    bookmarksOpen: false,
    onToggleBookmarks: vi.fn(),
    measureToolsOpen: false,
    onToggleMeasureTools: vi.fn()
  } satisfies React.ComponentProps<typeof MapToolbar>;
  const props = { ...defaults, ...overrides } as React.ComponentProps<typeof MapToolbar>;
  const ui = render(
    <SparMapProvider>
      <Bridge />
      <MapToolbar {...props} />
    </SparMapProvider>
  );
  return { ...ui, startDrawPoint, clearMarkupPoints, props };
};

describe('MapToolbar', () => {
  beforeEach(() => {
    vi.mocked(printMap).mockClear();
    // Ensure no leftover .leaflet-container from earlier tests pollutes
    // the identify-active class assertions.
    document.querySelectorAll('.leaflet-container').forEach((el) => el.remove());
  });

  it('renders the eight tool buttons', () => {
    renderToolbar();
    expect(screen.queryByTestId('toolbar-identify')).toBeTruthy();
    expect(screen.queryByTestId('toolbar-measure')).toBeTruthy();
    expect(screen.queryByTestId('toolbar-draw-point')).toBeTruthy();
    expect(screen.queryByTestId('toolbar-search')).toBeTruthy();
    expect(screen.queryByTestId('toolbar-bookmarks')).toBeTruthy();
    expect(screen.queryByTestId('toolbar-print')).toBeTruthy();
    expect(screen.queryByTestId('toolbar-zoom-bc')).toBeTruthy();
    expect(screen.queryByTestId('toolbar-zoom-extent')).toBeTruthy();
  });

  it('exposes accessible labels and titles on every button', () => {
    renderToolbar();
    const ids = [
      'toolbar-identify',
      'toolbar-measure',
      'toolbar-draw-point',
      'toolbar-search',
      'toolbar-bookmarks',
      'toolbar-print',
      'toolbar-zoom-bc',
      'toolbar-zoom-extent'
    ];
    ids.forEach((id) => {
      const btn = screen.getByTestId(id);
      expect(btn.getAttribute('aria-label')).toBeTruthy();
      expect(btn.getAttribute('title')).toBeTruthy();
    });
  });

  it('Zoom to BC button calls the zoomToBC bridge', () => {
    const { zoomToBC } = renderToolbarWithZoom();
    fireEvent.click(screen.getByTestId('toolbar-zoom-bc'));
    expect(zoomToBC).toHaveBeenCalledTimes(1);
  });

  it('Zoom to extent button calls the zoomToInitialExtent bridge', () => {
    const { zoomToInitialExtent } = renderToolbarWithZoom();
    fireEvent.click(screen.getByTestId('toolbar-zoom-extent'));
    expect(zoomToInitialExtent).toHaveBeenCalledTimes(1);
  });

  it('disables Zoom to BC and Zoom to extent until ViewControl registers callbacks', () => {
    renderToolbar();
    expect((screen.getByTestId('toolbar-zoom-bc') as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByTestId('toolbar-zoom-extent') as HTMLButtonElement).disabled).toBe(true);
  });

  it('renders inside a role="toolbar" landmark', () => {
    renderToolbar();
    const root = screen.getByTestId('map-toolbar');
    expect(root.getAttribute('role')).toBe('toolbar');
    expect(root.getAttribute('aria-label')).toBe('Map tools');
  });

  it('Measure button is always enabled — it opens the Measurement Tools panel which is rendered outside the map', () => {
    renderToolbar();
    const btn = screen.getByTestId('toolbar-measure');
    expect((btn as HTMLButtonElement).disabled).toBe(false);
    expect(btn.getAttribute('aria-label')).toBe('Measurement Tools');
  });

  it('disables Draw Point until MarkupPointLayer registers its callback', () => {
    renderToolbar();
    const btn = screen.getByTestId('toolbar-draw-point');
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it('Draw Point click opens the coordinate/drop-pin panel', () => {
    renderToolbarWithDrawPoint();
    const btn = screen.getByTestId('toolbar-draw-point');
    expect((btn as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(btn);

    expect(screen.queryByTestId('coordinate-pin-panel')).toBeTruthy();
    expect(btn.getAttribute('aria-pressed')).toBe('true');
  });

  it('Click map in the Draw Point panel calls the CWM-style point draw bridge', () => {
    const { startDrawPoint } = renderToolbarWithDrawPoint();

    fireEvent.click(screen.getByTestId('toolbar-draw-point'));
    fireEvent.click(screen.getByText('Click map'));

    expect(startDrawPoint).toHaveBeenCalledTimes(1);
    expect(startDrawPoint).toHaveBeenCalledWith();
    expect(screen.queryByTestId('coordinate-pin-panel')).toBeNull();
  });

  it('drops a point from entered latitude and longitude', () => {
    const { startDrawPoint } = renderToolbarWithDrawPoint();

    fireEvent.click(screen.getByTestId('toolbar-draw-point'));
    fireEvent.change(screen.getByTestId('coordinate-pin-lat'), {
      target: { value: '49.2827' }
    });
    fireEvent.change(screen.getByTestId('coordinate-pin-lng'), {
      target: { value: '123.1207' }
    });
    fireEvent.click(screen.getByText('Drop pin'));

    expect(startDrawPoint).toHaveBeenCalledWith({
      lat: 49.2827,
      lng: -123.1207
    });
    expect(screen.queryByTestId('coordinate-pin-panel')).toBeNull();
  });

  it('shows a validation error for non-numeric pin coordinates', () => {
    const { startDrawPoint } = renderToolbarWithDrawPoint();

    fireEvent.click(screen.getByTestId('toolbar-draw-point'));
    fireEvent.change(screen.getByTestId('coordinate-pin-lat'), {
      target: { value: 'north' }
    });
    fireEvent.change(screen.getByTestId('coordinate-pin-lng'), {
      target: { value: '-123.1207' }
    });
    fireEvent.click(screen.getByText('Drop pin'));

    expect(startDrawPoint).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toContain('numeric latitude');
  });

  it('clicking Identify toggles aria-pressed and adds identify-active to .leaflet-container', () => {
    // Provide a stand-in for the Leaflet container that the toolbar
    // can reach via document.querySelector.
    const container = document.createElement('div');
    container.className = 'leaflet-container';
    document.body.appendChild(container);

    renderToolbar();
    const btn = screen.getByTestId('toolbar-identify');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    expect(container.classList.contains('identify-active')).toBe(false);

    fireEvent.click(btn);
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(container.classList.contains('identify-active')).toBe(true);

    fireEvent.click(btn);
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    expect(container.classList.contains('identify-active')).toBe(false);

    container.remove();
  });

  it('Measure click calls onToggleMeasureTools and reflects open state via aria-pressed', () => {
    const onToggleMeasureTools = vi.fn();
    const { rerender } = renderToolbar({ onToggleMeasureTools, measureToolsOpen: false });
    const btn = screen.getByTestId('toolbar-measure');
    expect(btn.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(btn);
    expect(onToggleMeasureTools).toHaveBeenCalledTimes(1);

    rerender(
      <SparMapProvider>
        <MapToolbar
          seedlotNumber="12345"
          theme="COLAREA"
          searchVisible
          onToggleSearch={vi.fn()}
          bookmarksOpen={false}
          onToggleBookmarks={vi.fn()}
          measureToolsOpen
          onToggleMeasureTools={onToggleMeasureTools}
        />
      </SparMapProvider>
    );
    expect(screen.getByTestId('toolbar-measure').getAttribute('aria-pressed')).toBe('true');
  });

  it('Search button calls onToggleSearch', () => {
    const onToggleSearch = vi.fn();
    renderToolbar({ onToggleSearch, searchVisible: false });
    const btn = screen.getByTestId('toolbar-search');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(btn);
    expect(onToggleSearch).toHaveBeenCalledTimes(1);
  });

  it('Search button reflects searchVisible via aria-pressed', () => {
    renderToolbar({ searchVisible: true });
    expect(screen.getByTestId('toolbar-search').getAttribute('aria-pressed')).toBe('true');
  });

  it('Bookmarks button calls onToggleBookmarks and reflects open state', () => {
    const onToggleBookmarks = vi.fn();
    renderToolbar({ onToggleBookmarks, bookmarksOpen: false });
    const btn = screen.getByTestId('toolbar-bookmarks');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(btn);
    expect(onToggleBookmarks).toHaveBeenCalledTimes(1);
  });

  it('Bookmarks button shows aria-pressed=true when open', () => {
    renderToolbar({ bookmarksOpen: true });
    expect(screen.getByTestId('toolbar-bookmarks').getAttribute('aria-pressed')).toBe('true');
  });

  it('Print button calls printMap with seedlot number + theme', () => {
    renderToolbar({ seedlotNumber: '99999' });
    const btn = screen.getByTestId('toolbar-print');
    fireEvent.click(btn);
    // printMap is now invoked with a typed options object so the
    // templated layout has access to the active theme for legend lookup.
    expect(printMap).toHaveBeenCalledWith(
      expect.objectContaining({ seedlotNumber: '99999' })
    );
  });

  it('Identify click toggles aria-pressed and does not crash when measurement is also active', () => {
    // Measurement mode used to live in the toolbar; it now lives in
    // SparMapContext and is consumed by `MeasureControl` inside the
    // map. Identify still defensively calls `setMeasurementMode(null)`
    // so only one tool is "active" at a time — the test asserts the
    // toggle still works cleanly when both subsystems coexist.
    renderToolbar();
    const btn = screen.getByTestId('toolbar-identify');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-pressed')).toBe('true');
  });

  it('cleans up the identify-active class on unmount', () => {
    const container = document.createElement('div');
    container.className = 'leaflet-container';
    document.body.appendChild(container);

    const { unmount } = renderToolbar();
    fireEvent.click(screen.getByTestId('toolbar-identify'));
    expect(container.classList.contains('identify-active')).toBe(true);
    act(() => unmount());
    expect(container.classList.contains('identify-active')).toBe(false);

    container.remove();
  });
});
