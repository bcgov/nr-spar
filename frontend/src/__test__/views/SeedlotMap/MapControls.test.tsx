import React from 'react';
import { render, screen, act } from '@testing-library/react';
import L from 'leaflet';
import {
  describe, it, expect, vi, beforeEach
} from 'vitest';

import ViewControl, { BC_BOUNDS } from '../../../views/Seedlot/SeedlotMap/ViewControl';
import MarkupPointLayer from '../../../views/Seedlot/SeedlotMap/MarkupPointLayer';
import CursorPositionControl, {
  formatDms, formatLatLng, formatBcAlbers, formatUtm
} from '../../../views/Seedlot/SeedlotMap/CursorPositionControl';

type Handler = (e?: unknown) => void;

const mapEvents: Record<string, Handler> = {};
const onceEvents: Record<string, Handler> = {};
const container = document.createElement('div');
const fakeMap = {
  center: L.latLng(50, -125),
  zoom: 6,
  getCenter() { return this.center; },
  getZoom() { return this.zoom; },
  getContainer: () => container,
  setView: vi.fn(),
  fitBounds: vi.fn(),
  flyTo: vi.fn(),
  addLayer: vi.fn(),
  removeLayer: vi.fn(),
  on: vi.fn((names: string, fn: Handler) => { names.split(' ').forEach((n) => { mapEvents[n] = fn; }); }),
  off: vi.fn((names: string) => { names.split(' ').forEach((n) => { delete mapEvents[n]; delete onceEvents[n]; }); }),
  once: vi.fn((name: string, fn: Handler) => { onceEvents[name] = fn; })
};
fakeMap.setView.mockImplementation((center: [number, number] | L.LatLng, zoom: number) => {
  fakeMap.center = L.latLng(center);
  fakeMap.zoom = zoom;
});

const ctx = {
  _setMapControls: vi.fn(),
  _setViewHistoryAvailability: vi.fn()
};

vi.mock('react-leaflet', () => ({
  useMap: () => fakeMap,
  useMapEvent: (name: string, fn: Handler) => { mapEvents[name] = fn; }
}));
vi.mock('../../../contexts/SparMapContext', () => ({ useSparMap: () => ctx }));

const controls = () => ctx._setMapControls.mock.calls[0][0];
const availability = () => ctx._setViewHistoryAvailability.mock.lastCall?.[0];

const moveTo = (lat: number, lng: number, zoom: number) => {
  fakeMap.center = L.latLng(lat, lng);
  fakeMap.zoom = zoom;
  mapEvents.moveend();
};

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(mapEvents).forEach((k) => delete mapEvents[k]);
  Object.keys(onceEvents).forEach((k) => delete onceEvents[k]);
  fakeMap.center = L.latLng(50, -125);
  fakeMap.zoom = 6;
  container.style.cursor = '';
});

describe('ViewControl', () => {
  const initialBounds: L.LatLngBoundsExpression = [[48, -124], [49, -123]];

  it('steps back and forward through visited views', () => {
    render(<ViewControl initialBounds={initialBounds} />);
    expect(availability()).toEqual({ canGoBack: false, canGoForward: false });
    moveTo(49, -123, 10);
    moveTo(48.5, -123.5, 12);
    expect(availability()).toEqual({ canGoBack: true, canGoForward: false });

    controls().goBackView();
    expect(fakeMap.setView).toHaveBeenLastCalledWith([49, -123], 10, { animate: false });
    mapEvents.moveend(); // the programmatic move is not recorded as a new view
    expect(availability()).toEqual({ canGoBack: true, canGoForward: true });

    controls().goForwardView();
    expect(fakeMap.setView).toHaveBeenLastCalledWith([48.5, -123.5], 12, { animate: false });
    controls().goForwardView(); // already at the newest view
    expect(fakeMap.setView).toHaveBeenCalledTimes(2);
  });

  it('drops forward history after a new move, ignores repeat views and stops at the oldest', () => {
    render(<ViewControl initialBounds={initialBounds} />);
    moveTo(49, -123, 10);
    controls().goBackView();
    mapEvents.moveend();
    moveTo(51, -120, 8);
    expect(availability()).toEqual({ canGoBack: true, canGoForward: false });
    const calls = ctx._setViewHistoryAvailability.mock.calls.length;
    mapEvents.zoomend(); // same view again
    expect(ctx._setViewHistoryAvailability.mock.calls.length).toBe(calls);

    controls().goBackView();
    controls().goBackView();
    expect(fakeMap.setView).toHaveBeenCalledTimes(2);
  });

  it('keeps at most 50 views', () => {
    render(<ViewControl initialBounds={initialBounds} />);
    for (let i = 1; i <= 60; i += 1) moveTo(49, -123, i);
    for (let i = 0; i < 60; i += 1) {
      controls().goBackView();
      mapEvents.moveend();
    }
    expect(fakeMap.setView).toHaveBeenCalledTimes(49);
    expect(fakeMap.setView).toHaveBeenLastCalledWith([49, -123], 11, { animate: false });
  });

  it('exposes zoom, fly and view snapshot helpers', () => {
    render(<ViewControl initialBounds={initialBounds} />);
    const c = controls();
    c.zoomToBC();
    expect(fakeMap.fitBounds).toHaveBeenCalledWith(BC_BOUNDS, { animate: false });
    c.zoomToInitialExtent();
    expect(fakeMap.fitBounds).toHaveBeenCalledWith(initialBounds, { animate: false });
    c.flyToLocation(49.2, -123.1);
    expect(fakeMap.flyTo).toHaveBeenCalledWith([49.2, -123.1], 14);
    expect(c.getCurrentView()).toEqual({ center: [50, -125], zoom: 6 });
    c.restoreView([48, -123], 9);
    expect(fakeMap.setView).toHaveBeenLastCalledWith([48, -123], 9);
  });

  it('clears its controls on unmount', () => {
    const { unmount } = render(<ViewControl initialBounds={initialBounds} />);
    unmount();
    expect(ctx._setMapControls).toHaveBeenLastCalledWith(expect.objectContaining({ goBackView: null }));
    expect(availability()).toEqual({ canGoBack: false, canGoForward: false });
    expect(mapEvents.moveend).toBeUndefined();
  });
});

describe('MarkupPointLayer', () => {
  const addedMarkers = () => fakeMap.addLayer.mock.calls.map(([m]) => m as L.Marker);

  it('drops a pin at typed coordinates and zooms in', () => {
    render(<MarkupPointLayer />);
    controls().startDrawPoint({ lat: 49.25, lng: -123.1 });
    const marker = addedMarkers()[0];
    expect(marker.getLatLng()).toEqual(L.latLng(49.25, -123.1));
    expect(fakeMap.setView).toHaveBeenCalledWith(L.latLng(49.25, -123.1), 12, { animate: false });
    expect(marker.getTooltip()!.getContent()).toBe('49.250000, -123.100000');
    const popup = marker.getPopup()!.getContent() as string;
    expect(popup).toContain('Latitude: 49 15\'00.0"N');
    expect(popup).toContain('Longitude: 123 06\'00.0"W');
  });

  it('waits for a map click, with a crosshair, then drops the pin there', () => {
    render(<MarkupPointLayer />);
    controls().startDrawPoint();
    expect(container.style.cursor).toBe('crosshair');
    onceEvents.click({ latlng: L.latLng(-33.5, 151.25) });
    expect(container.style.cursor).toBe('');
    const popup = addedMarkers()[0].getPopup()!.getContent() as string;
    expect(popup).toContain('33 30\'00.0"S');
    expect(popup).toContain('151 15\'00.0"E');
  });

  it('rolls seconds that round up to 60 into the next minute', () => {
    render(<MarkupPointLayer />);
    controls().startDrawPoint({ lat: 49.9999999, lng: -123 });
    const popup = addedMarkers()[0].getPopup()!.getContent() as string;
    expect(popup).toContain('Latitude: 50 00\'00.0"N');
  });

  it('refreshes the popup when the pin is dragged', () => {
    render(<MarkupPointLayer />);
    controls().startDrawPoint({ lat: 49, lng: -123 });
    const marker = addedMarkers()[0];
    marker.setLatLng([48, -122]);
    marker.fire('dragend');
    expect(marker.getPopup()!.getContent()).toContain('Decimal: 48.000000, -122.000000');
  });

  it('cancels a pending click and clears every pin', () => {
    render(<MarkupPointLayer />);
    controls().startDrawPoint();
    controls().cancelDrawPoint();
    expect(fakeMap.off).toHaveBeenCalledWith('click', expect.any(Function));
    expect(container.style.cursor).toBe('');

    controls().startDrawPoint({ lat: 49, lng: -123 });
    const marker = addedMarkers()[0];
    const remove = vi.spyOn(marker, 'remove').mockImplementation(() => { throw new Error('detached'); });
    controls().clearMarkupPoints();
    expect(remove).toHaveBeenCalled();
    expect(fakeMap.removeLayer).toHaveBeenCalledWith(marker);
  });

  it('clears its controls on unmount', () => {
    const { unmount } = render(<MarkupPointLayer />);
    unmount();
    expect(ctx._setMapControls).toHaveBeenLastCalledWith({
      startDrawPoint: null, clearMarkupPoints: null, cancelDrawPoint: null
    });
  });
});

describe('CursorPositionControl', () => {
  it('shows the cursor position in three coordinate systems, and hides on mouseout', () => {
    render(<CursorPositionControl />);
    expect(screen.queryByTestId('cursor-position-control')).not.toBeInTheDocument();
    act(() => mapEvents.mousemove({ latlng: L.latLng(49.5, -123.25) }));
    const panel = screen.getByTestId('cursor-position-control');
    expect(panel).toHaveTextContent('49° 30\' 0.0" N, 123° 15\' 0.0" W');
    expect(panel).toHaveTextContent('(Zone 10)');
    act(() => mapEvents.mouseout());
    expect(screen.queryByTestId('cursor-position-control')).not.toBeInTheDocument();
  });

  it('formats degrees, minutes and seconds', () => {
    expect(formatDms(-0.5, 'lat')).toBe('0° 30\' 0.0" S');
    expect(formatDms(10.25, 'lng')).toBe('10° 15\' 0.0" E');
    expect(formatDms(Number.NaN, 'lat')).toBe('—');
    expect(formatLatLng(1, -1)).toBe('1° 00\' 0.0" N, 1° 00\' 0.0" W');
  });

  it('projects to UTM: the central meridian on the equator is the false origin', () => {
    expect(formatUtm(0, -123)).toBe('500000, 0 (Zone 10)');
    expect(formatUtm(49.2827, -123.1207)).toMatch(/^4912\d{2}, 54588\d{2} \(Zone 10\)$/);
    expect(formatUtm(-10, -123)).toMatch(/^500000, 889\d{4} \(Zone 10\)$/);
    expect(formatUtm(Number.NaN, 0)).toBe('—');
  });

  it('projects to BC Albers', () => {
    expect(formatBcAlbers(49.2827, -123.1207)).toMatch(/^\d{7}, \d{6}$/);
  });
});
