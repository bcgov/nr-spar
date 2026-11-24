import React from 'react';
import {
  render, screen, fireEvent, waitFor
} from '@testing-library/react';
import {
  describe, it, expect, vi, beforeEach
} from 'vitest';

import MapToolbar from '../../../views/Seedlot/SeedlotMap/MapToolbar';
import { printMap } from '../../../views/Seedlot/SeedlotMap/printMap';
import type { SparMapTheme } from '../../../types/SparMapTypes';

const ctx: Record<string, unknown> = {};

vi.mock('../../../contexts/SparMapContext', () => ({ useSparMap: () => ctx }));
vi.mock('../../../views/Seedlot/SeedlotMap/printMap', () => ({ printMap: vi.fn() }));

const props = {
  seedlotNumber: '60001',
  theme: {} as SparMapTheme,
  searchVisible: false,
  onToggleSearch: vi.fn(),
  bookmarksOpen: false,
  onToggleBookmarks: vi.fn(),
  measureToolsOpen: false,
  onToggleMeasureTools: vi.fn()
};

beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(ctx, {
    identifyActive: false,
    setIdentifyActive: vi.fn(),
    setMeasurementMode: vi.fn(),
    startDrawPoint: vi.fn(),
    cancelDrawPoint: vi.fn(),
    cancelAoiMode: vi.fn(),
    zoomToBC: vi.fn(),
    zoomToInitialExtent: vi.fn(),
    legendData: []
  });
});

describe('MapToolbar', () => {
  it('toggles identify mode and marks the map container', () => {
    const map = document.createElement('div');
    map.className = 'leaflet-container';
    document.body.appendChild(map);
    ctx.identifyActive = true;
    const { unmount } = render(<MapToolbar {...props} />);
    expect(map).toHaveClass('identify-active');
    fireEvent.click(screen.getByTestId('toolbar-identify'));
    expect(ctx.setIdentifyActive).toHaveBeenCalledWith(false);
    expect(ctx.setMeasurementMode).toHaveBeenCalledWith(null);
    unmount();
    expect(map).not.toHaveClass('identify-active');
    map.remove();
  });

  it('opens measurement tools, leaving identify mode', () => {
    ctx.identifyActive = true;
    render(<MapToolbar {...props} />);
    fireEvent.click(screen.getByTestId('toolbar-measure'));
    expect(props.onToggleMeasureTools).toHaveBeenCalled();
    expect(ctx.setIdentifyActive).toHaveBeenCalledWith(false);
  });

  it('passes through search, bookmarks and zoom', () => {
    render(<MapToolbar {...props} />);
    fireEvent.click(screen.getByTestId('toolbar-search'));
    fireEvent.click(screen.getByTestId('toolbar-bookmarks'));
    fireEvent.click(screen.getByTestId('toolbar-zoom-bc'));
    fireEvent.click(screen.getByTestId('toolbar-zoom-extent'));
    expect(props.onToggleSearch).toHaveBeenCalled();
    expect(props.onToggleBookmarks).toHaveBeenCalled();
    expect(ctx.zoomToBC).toHaveBeenCalled();
    expect(ctx.zoomToInitialExtent).toHaveBeenCalled();
  });

  it('drops a pin at typed coordinates and validates them', () => {
    ctx.identifyActive = true;
    render(<MapToolbar {...props} />);
    fireEvent.click(screen.getByTestId('toolbar-draw-point'));
    expect(ctx.setIdentifyActive).toHaveBeenCalledWith(false);
    fireEvent.click(screen.getByText('Drop pin'));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter numeric latitude and longitude.');
    fireEvent.change(screen.getByTestId('coordinate-pin-lat'), { target: { value: '49' } });
    fireEvent.change(screen.getByTestId('coordinate-pin-lng'), { target: { value: '200' } });
    fireEvent.click(screen.getByText('Drop pin'));
    expect(screen.getByRole('alert')).toHaveTextContent('Latitude must be -90 to 90');
    fireEvent.change(screen.getByTestId('coordinate-pin-lng'), { target: { value: '123.5' } });
    fireEvent.click(screen.getByText('Drop pin'));
    expect(ctx.startDrawPoint).toHaveBeenCalledWith({ lat: 49, lng: -123.5 });
    expect(screen.queryByTestId('coordinate-pin-panel')).not.toBeInTheDocument();
  });

  it('switches to click-the-map point placement', () => {
    render(<MapToolbar {...props} />);
    fireEvent.click(screen.getByTestId('toolbar-draw-point'));
    fireEvent.click(screen.getByText('Click map'));
    expect(ctx.startDrawPoint).toHaveBeenCalledWith();
  });

  it('disables Draw Point until the markup layer is ready', () => {
    ctx.startDrawPoint = null;
    ctx.zoomToBC = null;
    render(<MapToolbar {...props} />);
    expect(screen.getByTestId('toolbar-draw-point')).toBeDisabled();
    expect(screen.getByTestId('toolbar-zoom-bc')).toBeDisabled();
  });

  it('prints, and shows a failed print until dismissed', async () => {
    vi.mocked(printMap).mockRejectedValueOnce(new Error('canvas tainted'));
    render(<MapToolbar {...props} />);
    fireEvent.click(screen.getByTestId('toolbar-print'));
    await waitFor(() => expect(screen.getByTestId('toolbar-print-error')).toHaveTextContent('canvas tainted'));
    expect(printMap).toHaveBeenCalledWith({ seedlotNumber: '60001', theme: {}, legendData: [] });
    fireEvent.click(screen.getByTitle(/close notification/i));
    expect(screen.queryByTestId('toolbar-print-error')).not.toBeInTheDocument();
  });
});
