import React from 'react';
import { render, act } from '@testing-library/react';
import L from 'leaflet';
import {
  describe, it, expect, vi, beforeEach
} from 'vitest';

import MeasureControl from '../../../views/Seedlot/SeedlotMap/MeasureControl';

type MapHandler = (e?: { latlng: L.LatLng }) => void;

const mapEvents: Record<string, MapHandler> = {};
const container = document.createElement('div');
const fakeMap = {
  addLayer: vi.fn(),
  removeLayer: vi.fn(),
  doubleClickZoom: { enable: vi.fn(), disable: vi.fn() },
  _container: container
};

const ctx: Record<string, unknown> = {};

vi.mock('react-leaflet', () => ({
  useMap: () => fakeMap,
  useMapEvent: (name: string, fn: MapHandler) => { mapEvents[name] = fn; }
}));
vi.mock('../../../contexts/SparMapContext', () => ({ useSparMap: () => ctx }));

const setMode = (mode: string | null) => {
  ctx.measurementMode = mode;
};

const click = (lat: number, lng: number) => act(() => {
  mapEvents.click({ latlng: L.latLng(lat, lng) });
});
const dblclick = () => act(() => { mapEvents.dblclick(); });
const lastResult = () => (ctx.setMeasurementResult as ReturnType<typeof vi.fn>).mock.lastCall?.[0];

beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(ctx, {
    measurementMode: null,
    setMeasurementMode: vi.fn(),
    setMeasurementResult: vi.fn(),
    _setMapControls: vi.fn()
  });
  container.style.cursor = '';
});

describe('MeasureControl', () => {
  it('ignores clicks when no tool is active and restores double-click zoom', () => {
    render(<MeasureControl />);
    click(49, -123);
    expect(lastResult()).toBeNull();
    expect(fakeMap.doubleClickZoom.enable).toHaveBeenCalled();
    expect(fakeMap.addLayer).toHaveBeenCalled();
  });

  it('drops a point and reports its coordinates', () => {
    setMode('point');
    render(<MeasureControl />);
    expect(container.style.cursor).toBe('crosshair');
    expect(fakeMap.doubleClickZoom.disable).toHaveBeenCalled();
    click(49.5, -123.25);
    expect(lastResult()).toEqual({ pointLat: 49.5, pointLng: -123.25 });
    dblclick();
    expect(lastResult()).toEqual({ pointLat: 49.5, pointLng: -123.25 });
  });

  it('measures a running distance in metres, then kilometres', () => {
    setMode('distance');
    render(<MeasureControl />);
    click(49, -123);
    expect(lastResult()).toEqual({ distanceKm: 0 });
    click(49.001, -123);
    expect(lastResult().distanceKm).toBeCloseTo(0.111, 2);
    click(49.1, -123);
    expect(lastResult().distanceKm).toBeCloseTo(11.1, 0);
  });

  it('finishes on double-click, dropping the duplicate vertex, and starts fresh after', () => {
    setMode('distance');
    render(<MeasureControl />);
    click(49, -123);
    click(49.1, -123);
    click(49.1, -123); // double-click fires a second click at the same spot
    dblclick();
    expect(lastResult().distanceKm).toBeCloseTo(11.1, 0);

    click(50, -123);
    expect(lastResult()).toEqual({ distanceKm: 0 });
  });

  it('reports a running perimeter while drawing an area, then area and closed perimeter', () => {
    setMode('area');
    render(<MeasureControl />);
    click(49, -123);
    click(49, -122.99);
    expect(lastResult()).toHaveProperty('perimeterKm');
    expect(lastResult()).not.toHaveProperty('areaSqm');
    click(49.01, -122.99);
    dblclick();
    const result = lastResult();
    expect(result.areaSqm).toBeGreaterThan(0);
    expect(result.perimeterKm).toBeGreaterThan(0);
  });

  it('does not finish a measurement with fewer than two points', () => {
    setMode('area');
    render(<MeasureControl />);
    click(49, -123);
    const callsBefore = (ctx.setMeasurementResult as ReturnType<typeof vi.fn>).mock.calls.length;
    dblclick();
    expect((ctx.setMeasurementResult as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callsBefore);
  });

  it('resets when the mode changes', () => {
    setMode('distance');
    const { rerender } = render(<MeasureControl />);
    click(49, -123);
    click(49.1, -123);
    setMode('area');
    rerender(<MeasureControl />);
    expect(lastResult()).toBeNull();
    click(50, -123);
    expect(lastResult()).toEqual({ perimeterKm: 0 });
  });

  it('bridges the legacy start/clear measure controls and cleans up on unmount', () => {
    const { unmount } = render(<MeasureControl />);
    const controls = (ctx._setMapControls as ReturnType<typeof vi.fn>).mock.calls[0][0];
    controls.startMeasure();
    expect(ctx.setMeasurementMode).toHaveBeenCalledWith('distance');
    controls.clearMeasure();
    expect(ctx.setMeasurementMode).toHaveBeenCalledWith(null);

    unmount();
    expect(ctx._setMapControls).toHaveBeenLastCalledWith({ startMeasure: null, clearMeasure: null });
    expect(fakeMap.removeLayer).toHaveBeenCalled();
  });
});
