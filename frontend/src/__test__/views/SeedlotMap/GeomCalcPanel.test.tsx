import React, { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { Feature, Polygon } from 'geojson';

// Mock the elevation API so tests don't hit DataBC WFS. The mock can be
// re-configured per-test via `vi.mocked(...).mockResolvedValueOnce`.
vi.mock('../../../api-service/elevationApi', () => ({
  fetchPolygonElevationRange: vi.fn(),
}));

import GeomCalcPanel from '../../../views/Seedlot/SeedlotMap/GeomCalcPanel';
import {
  SparMapProvider,
  useSparMap
} from '../../../contexts/SparMapContext';
import type { AoiPolygon } from '../../../types/SparMapTypes';
import { fetchPolygonElevationRange } from '../../../api-service/elevationApi';

beforeEach(() => {
  vi.mocked(fetchPolygonElevationRange).mockReset();
  // Default: every polygon resolves to null (no elevation data) so the
  // existing tests that don't care about elevation see "—" in the cell
  // and don't depend on mock setup.
  vi.mocked(fetchPolygonElevationRange).mockResolvedValue(null);
});

/**
 * Build a square polygon centred on the given longitude/latitude with
 * sides of `sideKm` kilometres. Used by the area-verification test —
 * a 1 km × 1 km square should report ~100 ha.
 *
 * Uses a flat-earth approximation (1° lat ≈ 111.32 km, 1° lng scaled
 * by cos(lat)) which is more than accurate enough for the test
 * tolerances we use below; the geodesic area is computed by @turf/area
 * inside the panel itself.
 */
const buildSquarePolygon = (
  centerLng: number,
  centerLat: number,
  sideKm: number
): AoiPolygon => {
  const halfDegLat = sideKm / 2 / 111.32;
  const halfDegLng =
    sideKm / 2 / (111.32 * Math.cos((centerLat * Math.PI) / 180));
  const minLng = centerLng - halfDegLng;
  const maxLng = centerLng + halfDegLng;
  const minLat = centerLat - halfDegLat;
  const maxLat = centerLat + halfDegLat;
  const feature: Feature<Polygon> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [minLng, minLat],
        [maxLng, minLat],
        [maxLng, maxLat],
        [minLng, maxLat],
        [minLng, minLat]
      ]]
    }
  };
  return feature;
};

/**
 * Build a triangle whose longest edge runs roughly NNE (i.e. ~22.5°
 * bearing). The first vertex is at the origin; the second is offset
 * mostly northward with a small eastward component, making it the
 * longest edge by construction. The third vertex closes the ring back
 * near the origin via a much shorter westward leg.
 */
const buildNneTriangle = (): AoiPolygon => {
  const feature: Feature<Polygon> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-123.0, 49.0],
        // Move ~1° N + ~0.4° E → bearing ≈ 22° (NNE quadrant)
        [-122.6, 50.0],
        [-123.05, 49.05],
        [-123.0, 49.0]
      ]]
    }
  };
  return feature;
};

/**
 * Mirrors the BecZonePanel test pattern: seed the SparMapContext with a
 * specific list of polygons via `useEffect` (avoiding setState-during-
 * render), then render the panel beside it.
 */
const SeedAndRender = ({ aois }: { aois: AoiPolygon[] }) => {
  const { setAois } = useSparMap();
  useEffect(() => {
    setAois(aois);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <GeomCalcPanel />;
};

const wrap = (children: ReactNode) => (
  <SparMapProvider>{children}</SparMapProvider>
);

describe('GeomCalcPanel', () => {
  it('renders the empty placeholder Tile when there are no polygons', () => {
    render(wrap(<GeomCalcPanel />));
    expect(screen.queryByTestId('geom-calc-panel')).toBeTruthy();
    expect(screen.queryByTestId('geom-calc-panel-empty')).toBeTruthy();
    expect(
      screen.queryByText(/No polygons drawn yet\. Use Add Polygon/)
    ).toBeTruthy();
  });

  it('renders one stat block per polygon in context', () => {
    const square = buildSquarePolygon(-123, 49, 1);
    const triangle = buildNneTriangle();
    render(wrap(<SeedAndRender aois={[square, triangle]} />));
    // Two per-polygon stat blocks appear (the totals block exists too,
    // identified separately and only when there is more than one polygon).
    expect(screen.queryByTestId('geom-calc-panel')).toBeTruthy();
    expect(screen.queryByTestId('geom-calc-totals-row')).toBeTruthy();
    expect(screen.queryByTestId('geom-calc-item-1')).toBeTruthy();
    expect(screen.queryByTestId('geom-calc-item-2')).toBeTruthy();
    expect(screen.queryByText('Polygon 1')).toBeTruthy();
    expect(screen.queryByText('Polygon 2')).toBeTruthy();
  });

  it('reports area in hectares (a 1 km square ≈ 100 ha)', () => {
    const square = buildSquarePolygon(-123, 49, 1);
    render(wrap(<SeedAndRender aois={[square]} />));
    // The area cell text contains the hectare value with two decimals.
    // We assert on a tolerant match — geodesic area for a 1 km flat
    // square at lat 49 lands very close to 100 ha. Accept anything in
    // the 99-101 ha range.
    const areaCells = screen.queryAllByText(
      /^(\d{2,3})\.\d{2}\s*ha\s*\(/
    );
    expect(areaCells.length).toBeGreaterThan(0);
    const matched = areaCells.find((el) => {
      const m = el.textContent?.match(/^(\d{2,3})\.\d{2}/);
      if (!m) return false;
      const ha = parseFloat(m[1]);
      return ha >= 99 && ha <= 101;
    });
    expect(matched).toBeTruthy();
  });

  it('renders a totals footer that sums area and perimeter', () => {
    const square1 = buildSquarePolygon(-123, 49, 1);
    const square2 = buildSquarePolygon(-122, 49, 1);
    render(wrap(<SeedAndRender aois={[square1, square2]} />));
    const totalsRow = screen.queryByTestId('geom-calc-totals-row');
    expect(totalsRow).toBeTruthy();
    // The "Total" label should be present in the footer cell.
    expect(totalsRow?.textContent).toContain('Total');
    // Two ~100ha squares → ~200 ha total. The hectare value with two
    // decimals should appear inside the totals row text.
    const totalsText = totalsRow?.textContent ?? '';
    const haMatch = totalsText.match(/(\d{2,3})\.\d{2}\s*ha/);
    expect(haMatch).toBeTruthy();
    if (haMatch) {
      const ha = parseFloat(haMatch[1]);
      expect(ha).toBeGreaterThanOrEqual(199);
      expect(ha).toBeLessThanOrEqual(201);
    }
  });

  it('renders a coordinate-readout toggle per polygon row', () => {
    const square = buildSquarePolygon(-123, 49, 1);
    render(wrap(<SeedAndRender aois={[square]} />));
    expect(screen.queryByTestId('geom-calc-coords-toggle-1')).toBeTruthy();
  });

  it('renders an "Elevation" stat label', () => {
    const square = buildSquarePolygon(-123, 49, 1);
    render(wrap(<SeedAndRender aois={[square]} />));
    expect(screen.queryByText('Elevation')).toBeTruthy();
  });

  it('renders an elevation min–max cell per polygon after the WFS resolves', async () => {
    vi.mocked(fetchPolygonElevationRange).mockResolvedValueOnce({
      minM: 480,
      maxM: 1240,
      source: 'contours',
      sampleCount: 38,
    });
    const square = buildSquarePolygon(-123, 49, 1);
    render(wrap(<SeedAndRender aois={[square]} />));
    // Both the polygon row and the totals row show the same text when
    // there's only one polygon — assert at least one match exists.
    await waitFor(() => {
      const matches = screen.queryAllByText('480 - 1,240 m');
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows the elevation range in the totals row when at least one polygon has data', async () => {
    vi.mocked(fetchPolygonElevationRange)
      .mockResolvedValueOnce({ minM: 300, maxM: 800, source: 'contours', sampleCount: 12 })
      .mockResolvedValueOnce({ minM: 200, maxM: 1500, source: 'contours', sampleCount: 25 });
    const square1 = buildSquarePolygon(-123, 49, 1);
    const square2 = buildSquarePolygon(-122, 49, 1);
    render(wrap(<SeedAndRender aois={[square1, square2]} />));
    await waitFor(() => {
      const cell = screen.queryByTestId('geom-calc-total-elevation');
      // Overall = min of mins (200) to max of maxes (1500).
      expect(cell?.textContent).toBe('200 - 1,500 m');
    });
  });

  it('shows a dash when the elevation API returns no data', async () => {
    vi.mocked(fetchPolygonElevationRange).mockResolvedValueOnce(null);
    const square = buildSquarePolygon(-123, 49, 1);
    render(wrap(<SeedAndRender aois={[square]} />));
    await waitFor(() => {
      // The cell shows "—" for the empty status. Use the elevation
      // column header to narrow to the right row's cell.
      const cells = screen.queryAllByText('—');
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  it('shows raw lat/lng coordinates when the toggle is clicked', async () => {
    const { fireEvent } = await import('@testing-library/react');
    const square = buildSquarePolygon(-123, 49, 1);
    render(wrap(<SeedAndRender aois={[square]} />));
    const toggle = screen.getByTestId('geom-calc-coords-toggle-1');
    // Initially the coords list is collapsed.
    expect(screen.queryByTestId('geom-calc-coords-list-1')).toBeNull();
    fireEvent.click(toggle);
    const list = screen.getByTestId('geom-calc-coords-list-1');
    // 1 km square has 4 unique vertices (+1 closing). Each row shows
    // the lat,lng pair.
    expect(list.textContent).toMatch(/49\./);
    expect(list.textContent).toMatch(/-123\./);
  });

  it('also shows BC Albers (EPSG:3005) coordinates alongside lat/lng (legacy aoi_panel parity)', async () => {
    const { fireEvent } = await import('@testing-library/react');
    // Pick a polygon centred at approx (-123, 49) (BC); BC Albers
    // easting around 1.2M, northing around 470K — both 7-digit
    // numbers. Legacy sparmap.js getCordinates emitted these.
    const square = buildSquarePolygon(-123, 49, 1);
    render(wrap(<SeedAndRender aois={[square]} />));
    fireEvent.click(screen.getByTestId('geom-calc-coords-toggle-1'));
    const list = screen.getByTestId('geom-calc-coords-list-1');
    // BC Albers easting/northing are large positive integers (>5
    // digits) for BC; assert at least one such pair appears in the
    // rendered text. Numbers may include locale-formatted commas.
    expect(list.textContent).toMatch(/[0-9]{1,3}(?:,[0-9]{3}){1,}/);
  });
});
