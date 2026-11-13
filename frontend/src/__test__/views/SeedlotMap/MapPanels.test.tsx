import React from 'react';
import {
  render, screen, fireEvent, waitFor
} from '@testing-library/react';
import {
  describe, it, expect, vi, beforeEach
} from 'vitest';

import BookmarksPanel from '../../../views/Seedlot/SeedlotMap/BookmarksPanel';
import MeasurementToolsPanel from '../../../views/Seedlot/SeedlotMap/MeasurementToolsPanel';
import SearchControl from '../../../views/Seedlot/SeedlotMap/SearchControl';
import { searchLocation } from '../../../api-service/geocoderApi';

const ctx: Record<string, unknown> = {};

vi.mock('../../../contexts/SparMapContext', () => ({ useSparMap: () => ctx }));
vi.mock('../../../api-service/geocoderApi', () => ({ searchLocation: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(ctx).forEach((k) => delete ctx[k]);
});

describe('BookmarksPanel', () => {
  beforeEach(() => {
    Object.assign(ctx, {
      getCurrentView: vi.fn(() => ({ center: [49.2, -123.1], zoom: 11 })),
      restoreView: vi.fn()
    });
  });

  it('saves the current view under a name, returns to it and deletes it', () => {
    render(<BookmarksPanel />);
    expect(screen.getByTestId('bookmarks-panel-empty')).toBeInTheDocument();
    expect(screen.getByTestId('bookmark-save')).toBeDisabled();

    fireEvent.change(screen.getByTestId('bookmark-name-input'), { target: { value: '  Harbour  ' } });
    fireEvent.click(screen.getByTestId('bookmark-save'));
    expect(screen.getByTestId('bookmarks-panel-list')).toHaveTextContent('Harbour');
    expect(screen.getByTestId('bookmark-name-input')).toHaveValue('');

    fireEvent.click(screen.getByText('Go'));
    expect(ctx.restoreView).toHaveBeenCalledWith([49.2, -123.1], 11);

    fireEvent.click(screen.getByRole('button', { name: 'Delete bookmark' }));
    expect(screen.getByTestId('bookmarks-panel-empty')).toBeInTheDocument();
  });

  it('cannot save before the map has registered its view', () => {
    ctx.getCurrentView = null;
    render(<BookmarksPanel />);
    fireEvent.change(screen.getByTestId('bookmark-name-input'), { target: { value: 'Harbour' } });
    expect(screen.getByTestId('bookmark-save')).toBeDisabled();
  });
});

describe('MeasurementToolsPanel', () => {
  const renderWith = (mode: string | null, result: Record<string, number> | null) => {
    Object.assign(ctx, { measurementMode: mode, setMeasurementMode: vi.fn(), measurementResult: result });
    return render(<MeasurementToolsPanel />);
  };

  it('switches modes and clears', () => {
    renderWith(null, null);
    expect(screen.getByText('Pick a mode below to start measuring.')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('measure-distance-btn'));
    fireEvent.click(screen.getByTestId('measure-area-btn'));
    fireEvent.click(screen.getByTestId('measure-point-btn'));
    fireEvent.click(screen.getByTestId('measure-clear-btn'));
    expect(vi.mocked(ctx.setMeasurementMode as () => void).mock.calls.map((c) => (c as unknown[])[0]))
      .toEqual(['distance', 'area', 'point', null]);
    ['measure-distance-value', 'measure-perimeter-value', 'measure-area-value', 'measure-point-value']
      .forEach((id) => expect(screen.getByTestId(id)).toHaveTextContent('—'));
  });

  it('shows distances in metres or kilometres', () => {
    const { unmount } = renderWith('distance', { distanceKm: 0.4567 });
    expect(screen.getByTestId('measure-distance-btn')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/Double-click to finish/)).toBeInTheDocument();
    expect(screen.getByTestId('measure-distance-value')).toHaveTextContent('457 m');
    unmount();
    renderWith('distance', { distanceKm: 12.345 });
    expect(screen.getByTestId('measure-distance-value')).toHaveTextContent('12.35 km');
  });

  it('shows areas in square metres or hectares', () => {
    const { unmount } = renderWith('area', { areaSqm: 5000, perimeterKm: 0 });
    expect(screen.getByText(/close the polygon/)).toBeInTheDocument();
    expect(screen.getByTestId('measure-area-value')).toHaveTextContent('5000 m²');
    expect(screen.getByTestId('measure-perimeter-value')).toHaveTextContent('0 m');
    unmount();
    renderWith('area', { areaSqm: 250_000, perimeterKm: 2 });
    expect(screen.getByTestId('measure-area-value')).toHaveTextContent('25.00 ha');
  });

  it('shows a dropped point', () => {
    renderWith('point', { pointLat: 49.123456, pointLng: -123.654321, areaSqm: 0 });
    expect(screen.getByText('Click on the map to drop a point.')).toBeInTheDocument();
    expect(screen.getByTestId('measure-point-value')).toHaveTextContent('49.12346, -123.65432');
    expect(screen.getByTestId('measure-area-value')).toHaveTextContent('0 m²');
  });
});

describe('SearchControl', () => {
  beforeEach(() => {
    ctx.flyToLocation = vi.fn();
  });

  const type = (value: string) => fireEvent.change(screen.getByRole('searchbox'), { target: { value } });

  it('waits for three characters before searching', async () => {
    render(<SearchControl />);
    type('Vi');
    await new Promise((r) => { setTimeout(r, 400); });
    expect(searchLocation).not.toHaveBeenCalled();
  });

  it('searches after a pause and flies to the chosen result', async () => {
    vi.mocked(searchLocation).mockResolvedValue([
      {
        fullAddress: 'Victoria, BC', latitude: 48.43, longitude: -123.37, score: 97.6
      }
    ] as never);
    render(<SearchControl />);
    type('Vic');
    type('Victoria');
    await waitFor(() => expect(screen.getByTestId('search-result-0')).toHaveTextContent('Victoria, BC (98%)'));
    expect(searchLocation).toHaveBeenCalledTimes(1);
    expect(searchLocation).toHaveBeenCalledWith('Victoria');

    fireEvent.click(screen.getByRole('button', { name: /Victoria, BC/ }));
    expect(ctx.flyToLocation).toHaveBeenCalledWith(48.43, -123.37, 14);
    expect(screen.getByRole('searchbox')).toHaveValue('');
  });

  it('reports an unavailable geocoder', async () => {
    vi.mocked(searchLocation).mockRejectedValue(new Error('503'));
    render(<SearchControl />);
    type('Victoria');
    await waitFor(() => expect(screen.getByTestId('search-control-error')).toHaveTextContent('Search unavailable: 503'));
    expect(screen.queryByTestId('search-control-results')).not.toBeInTheDocument();
  });

  it('shows a loading hint while searching', async () => {
    vi.mocked(searchLocation).mockReturnValue(new Promise(() => {}) as never);
    render(<SearchControl />);
    type('Victoria');
    expect(await screen.findByTestId('search-control-loading')).toBeInTheDocument();
  });
});
