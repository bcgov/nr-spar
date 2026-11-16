import React from 'react';
import {
  render, screen, fireEvent, waitFor
} from '@testing-library/react';
import {
  describe, it, expect, vi, beforeEach
} from 'vitest';

import GeomCalcPanel from '../../../views/Seedlot/SeedlotMap/GeomCalcPanel';
import { fetchPolygonElevationRange } from '../../../api-service/elevationApi';
import type { AoiPolygon } from '../../../types/SparMapTypes';

const ctx: { aois: AoiPolygon[] } = { aois: [] };

vi.mock('../../../contexts/SparMapContext', () => ({ useSparMap: () => ctx }));
vi.mock('../../../api-service/elevationApi', () => ({ fetchPolygonElevationRange: vi.fn() }));

// ~1 km x ~1 km (~100 ha) box near Victoria; 4 vertices + closer.
const box = (lngOffset = 0): AoiPolygon => ({
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [-123.4 + lngOffset, 48.4],
      [-123.3864 + lngOffset, 48.4],
      [-123.3864 + lngOffset, 48.409],
      [-123.4 + lngOffset, 48.409],
      [-123.4 + lngOffset, 48.4]
    ]]
  }
} as AoiPolygon);

beforeEach(() => {
  vi.clearAllMocks();
  ctx.aois = [];
});

describe('GeomCalcPanel', () => {
  it('prompts to draw when there are no polygons', () => {
    render(<GeomCalcPanel />);
    expect(screen.getByTestId('geom-calc-panel-empty')).toHaveTextContent('No polygons drawn yet');
    expect(fetchPolygonElevationRange).not.toHaveBeenCalled();
  });

  it('shows area, perimeter, vertex count and elevation for one polygon', async () => {
    vi.mocked(fetchPolygonElevationRange).mockResolvedValue({ minM: 20, maxM: 1200 } as never);
    ctx.aois = [box()];
    render(<GeomCalcPanel />);
    const item = screen.getByTestId('geom-calc-item-1');
    expect(item).toHaveTextContent(/Area100\.\d\d ha \(1,00\d,\d{3} m²\)/);
    expect(item).toHaveTextContent(/Perimeter4,0\d\d m/);
    expect(item).toHaveTextContent('Vertices4');
    expect(screen.getByTestId('geom-calc-elevation-1')).toHaveTextContent('…');
    await waitFor(() => expect(screen.getByTestId('geom-calc-elevation-1')).toHaveTextContent('20 - 1,200 m'));
    expect(screen.queryByTestId('geom-calc-totals-row')).not.toBeInTheDocument();
  });

  it('toggles the vertex list in BC Albers and lat/lng', () => {
    vi.mocked(fetchPolygonElevationRange).mockResolvedValue(null as never);
    ctx.aois = [box()];
    render(<GeomCalcPanel />);
    fireEvent.click(screen.getByTestId('geom-calc-coords-toggle-1'));
    const list = screen.getByTestId('geom-calc-coords-list-1');
    expect(list.querySelectorAll('li')).toHaveLength(4);
    expect(list).toHaveTextContent('(48.400000, -123.400000)');
    fireEvent.click(screen.getByTestId('geom-calc-coords-toggle-1'));
    expect(screen.queryByTestId('geom-calc-coords-list-1')).not.toBeInTheDocument();
  });

  it('totals several polygons and reports the overall elevation range', async () => {
    vi.mocked(fetchPolygonElevationRange)
      .mockResolvedValueOnce({ minM: 100, maxM: 100 } as never)
      .mockResolvedValueOnce({ minM: 50, maxM: 400 } as never);
    ctx.aois = [box(), box(1)];
    render(<GeomCalcPanel />);
    expect(screen.getByTestId('geom-calc-totals-row')).toHaveTextContent(/Total area200\.\d\d ha/);
    expect(screen.getByTestId('geom-calc-total-elevation')).toHaveTextContent('—');
    await waitFor(() => expect(screen.getByTestId('geom-calc-total-elevation')).toHaveTextContent('50 - 400 m'));
    expect(screen.getByTestId('geom-calc-elevation-1')).toHaveTextContent(/^100 m$/);
  });

  it('shows a dash for no elevation data and "error" for a failed lookup', async () => {
    vi.mocked(fetchPolygonElevationRange)
      .mockResolvedValueOnce(null as never)
      .mockRejectedValueOnce(new Error('WFS down'));
    ctx.aois = [box(), box(1)];
    render(<GeomCalcPanel />);
    await waitFor(() => expect(screen.getByTestId('geom-calc-elevation-2')).toHaveTextContent('error'));
    expect(screen.getByTestId('geom-calc-elevation-1')).toHaveTextContent('—');
  });

  it('reuses cached elevation when an unchanged polygon re-renders', async () => {
    vi.mocked(fetchPolygonElevationRange).mockResolvedValue({ minM: 1, maxM: 2 } as never);
    ctx.aois = [box()];
    const { rerender } = render(<GeomCalcPanel />);
    await waitFor(() => expect(screen.getByTestId('geom-calc-elevation-1')).toHaveTextContent('1 - 2 m'));
    ctx.aois = [box(), box(1)];
    rerender(<GeomCalcPanel />);
    await waitFor(() => expect(fetchPolygonElevationRange).toHaveBeenCalledTimes(2));
  });

  it('skips a polygon whose ring is too short to measure', () => {
    vi.mocked(fetchPolygonElevationRange).mockResolvedValue(null as never);
    const broken = { ...box(), geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 1]]] } } as AoiPolygon;
    ctx.aois = [broken];
    render(<GeomCalcPanel />);
    expect(screen.queryByTestId('geom-calc-item-1')).not.toBeInTheDocument();
  });
});
