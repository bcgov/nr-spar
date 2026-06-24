import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';

import MeasureControl from '../../../views/Seedlot/SeedlotMap/MeasureControl';
import {
  SparMapProvider,
  useSparMap
} from '../../../contexts/SparMapContext';

/**
 * MeasureControl is a side-effect-only component that wires itself into
 * react-leaflet's map handle and into the SparMapContext bridge. We
 * mock react-leaflet with a deterministic stub so we can:
 *   1. Verify the component mounts without crashing inside a
 *      <SparMapProvider>.
 *   2. Drive the bridge callbacks (`startMeasure` / `clearMeasure`)
 *      registered by the effect and verify they don't throw.
 *
 * This mirrors the LeafletMap.test.tsx mock pattern; the noopMap exposes
 * just enough of the Leaflet handle for the effect to run.
 */
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
    off: () => {},
    doubleClickZoom: {
      enable: () => {},
      disable: () => {}
    },
    addLayer: () => {},
    removeLayer: () => {},
    _container: { style: {} as Record<string, string> }
  };
  return {
    MapContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="map-container">{children}</div>
    ),
    TileLayer: () => <div data-testid="tile-layer" />,
    WMSTileLayer: () => <div data-testid="wms-tile-layer" />,
    useMap: () => noopMap,
    // useMapEvent is called for both 'click' and 'dblclick'. The
    // component doesn't rely on the return value, so a noop is fine.
    useMapEvent: () => {},
    GeoJSON: () => <div data-testid="geojson-overlay" />,
    Popup: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="popup">{children}</div>
    )
  };
});

// Leaflet CSS is a static import in LeafletMap, but MeasureControl
// imports `leaflet` directly which jsdom can resolve. No CSS stub
// needed here.

/**
 * Test harness that captures the SparMapContext value into a ref so the
 * test can invoke the bridge callbacks the same way the AoiToolbar
 * would in production.
 */
const HarnessInner = ({
  captureRef
}: {
  captureRef: { current: ReturnType<typeof useSparMap> | null };
}) => {
  // eslint-disable-next-line no-param-reassign
  captureRef.current = useSparMap();
  return <MeasureControl />;
};

const renderHarness = () => {
  const captureRef: { current: ReturnType<typeof useSparMap> | null } = {
    current: null
  };
  const utils = render(
    <SparMapProvider>
      <HarnessInner captureRef={captureRef} />
    </SparMapProvider>
  );
  return { ...utils, captureRef };
};

describe('MeasureControl', () => {
  it('mounts without crashing inside a SparMapProvider + react-leaflet mock', () => {
    const { captureRef } = renderHarness();
    // The provider should have a context value populated.
    expect(captureRef.current).not.toBeNull();
  });

  it('registers a startMeasure callback on the SparMapContext bridge', () => {
    const { captureRef } = renderHarness();
    // After mount, the bridge should expose a non-null startMeasure
    // function — that's how the AoiToolbar gates its button.
    expect(typeof captureRef.current?.startMeasure).toBe('function');
  });

  it('registers a clearMeasure callback on the SparMapContext bridge', () => {
    const { captureRef } = renderHarness();
    expect(typeof captureRef.current?.clearMeasure).toBe('function');
  });

  it('startMeasure and clearMeasure run without throwing', () => {
    const { captureRef } = renderHarness();
    // Call both bridge callbacks the same way the toolbar would.
    // Wrapped in act() because they may trigger React state updates.
    expect(() =>
      act(() => {
        captureRef.current?.startMeasure?.();
      })
    ).not.toThrow();
    expect(() =>
      act(() => {
        captureRef.current?.clearMeasure?.();
      })
    ).not.toThrow();
  });
});
