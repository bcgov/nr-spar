/* eslint-disable react/jsx-props-no-spreading */
import React, {
  useEffect, useMemo, useRef, useState
} from 'react';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  Tile,
  Button
} from '@carbon/react';
import { ChevronDown, ChevronUp } from '@carbon/icons-react';
import area from '@turf/area';
import length from '@turf/length';
import distance from '@turf/distance';
import bearing from '@turf/bearing';
import { lineString, point as turfPoint } from '@turf/helpers';

import { useSparMap } from '../../../../contexts/SparMapContext';
import type { AoiPolygon } from '../../../../types/SparMapTypes';
import { wgs84ToBcAlbers } from '../../../../legacy_translated/SPR_SPATIAL_UTILS';
import {
  fetchPolygonElevationRange,
  type ElevationRange
} from '../../../../api-service/elevationApi';

/**
 * GEOMCALC tool — read-only Carbon DataTable that lists per-polygon
 * geometry metrics for every AOI in `SparMapContext.aois`. Mirrors the
 * legacy SPAR cwmSparmap.jsp GEOMCALC panel.
 *
 * Computed columns:
 *  - #          : 1-based polygon index
 *  - Area       : geodesic area in hectares with raw m² in parentheses
 *  - Perimeter  : outer-ring length in metres
 *  - Vertices   : number of unique vertices on the outer ring (excludes
 *                 the duplicated first/last point of the closed ring)
 *  - Longest    : compass bearing of the longest edge, e.g. "NNE (45°)"
 *
 * A totals row at the bottom sums area + perimeter across all polygons.
 *
 * When `aois.length === 0` the panel renders a Carbon `Tile` placeholder
 * instead of an empty table — easier on the eye than a 0-row table.
 *
 * Lives OUTSIDE the `<MapContainer>` because it neither needs map
 * events nor a Leaflet handle — pure computation over context state.
 */

/** Number formatter — Canadian English thousands grouping. */
const formatNumber = (value: number, fractionDigits = 0): string => (Number.isFinite(value)
  ? value.toLocaleString('en-CA', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  })
  : '—');

/**
 * 16-point compass labels indexed by `Math.round(((bearing + 360) % 360)
 * / 22.5) % 16`. Standard meteorological convention — north is 0°,
 * clockwise.
 */
const COMPASS_LABELS = [
  'N', 'NNE', 'NE', 'ENE',
  'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW',
  'W', 'WNW', 'NW', 'NNW'
];

/**
 * Convert a bearing in degrees (-180..180 from @turf/bearing) into a
 * 16-point compass label like `NNE`. Normalises negative bearings into
 * the 0..360 range first.
 */
const bearingToCompass = (deg: number): string => {
  if (!Number.isFinite(deg)) return '—';
  const normalised = (deg + 360) % 360;
  const idx = Math.round(normalised / 22.5) % 16;
  return COMPASS_LABELS[idx];
};

interface PolygonMetrics {
  /** 1-based human-readable index. */
  index: number;
  /** Geodesic area in square metres. */
  areaSqm: number;
  /** Outer-ring perimeter in metres. */
  perimeterM: number;
  /** Vertex count on the outer ring (excluding the duplicated closer). */
  vertexCount: number;
  /** Bearing of the longest edge, normalised to 0..360 degrees. */
  longestEdgeBearingDeg: number;
}

/**
 * Compute the per-polygon metrics for a single AOI feature. Returns
 * null when the geometry can't be parsed (defensive — context state is
 * already filtered to Polygon features by AoiDrawLayer).
 */
const computeMetrics = (poly: AoiPolygon, idx: number): PolygonMetrics | null => {
  const ring = poly.geometry?.coordinates?.[0];
  if (!Array.isArray(ring) || ring.length < 4) {
    // A valid GeoJSON Polygon outer ring has at least 4 positions
    // (3 unique + the closing duplicate). Anything smaller can't be
    // measured meaningfully.
    return null;
  }

  const areaSqm = area(poly);

  // Convert the ring to a lineString so @turf/length can walk it.
  // length() returns kilometres by default — convert to metres for the
  // display column.
  const ls = lineString(ring as [number, number][]);
  const perimeterM = length(ls, { units: 'kilometers' }) * 1000;

  // Vertex count excludes the closing duplicate (first === last).
  const vertexCount = ring.length - 1;

  // Walk every edge of the outer ring; track the longest one. We use
  // @turf/distance for the length comparison and @turf/bearing for the
  // angle. Zero-length edges are ignored.
  let longestEdgeKm = 0;
  let longestEdgeBearingDeg = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const a = ring[i];
    const b = ring[i + 1];
    const fromPt = turfPoint(a as [number, number]);
    const toPt = turfPoint(b as [number, number]);
    const segKm = distance(fromPt, toPt, { units: 'kilometers' });
    if (segKm > longestEdgeKm) {
      longestEdgeKm = segKm;
      const rawBearing = bearing(fromPt, toPt);
      // Normalise into 0..360 for the compass label conversion.
      longestEdgeBearingDeg = (rawBearing + 360) % 360;
    }
  }

  return {
    index: idx + 1,
    areaSqm,
    perimeterM,
    vertexCount,
    longestEdgeBearingDeg
  };
};

interface GeomCalcRow {
  id: string;
  index: string;
  areaCell: string;
  perimeter: string;
  vertices: string;
  longest: string;
  elevation: string;
}

interface GeomCalcCell {
  id: string;
  value: string;
  info: { header: string };
}

interface GeomCalcDataTableRow {
  id: string;
  cells: GeomCalcCell[];
}

interface GeomCalcHeader {
  key: string;
  header: string;
}

interface GeomCalcTableRenderProps {
  rows: GeomCalcDataTableRow[];
  headers: GeomCalcHeader[];
  getHeaderProps: (opts: { header: GeomCalcHeader }) => Record<string, unknown>;
  getRowProps: (opts: { row: GeomCalcDataTableRow }) => Record<string, unknown>;
  getTableProps: () => Record<string, unknown>;
}

const headers: GeomCalcHeader[] = [
  { key: 'index', header: '#' },
  { key: 'areaCell', header: 'Area' },
  { key: 'perimeter', header: 'Perimeter' },
  { key: 'vertices', header: 'Vertices' },
  { key: 'longest', header: 'Longest Edge' },
  { key: 'elevation', header: 'Elevation' }
];

type ElevationCellState =
  | { status: 'loading' }
  | { status: 'ready'; range: ElevationRange }
  | { status: 'empty' }
  | { status: 'error' };

/**
 * Stable cache key for an AOI polygon. Uses JSON.stringify of the
 * coordinates — small for typical AOIs (a few dozen vertices) and
 * stable across re-renders as long as the geometry is unchanged.
 * Switching to a real hash would only matter for very high-vertex
 * polygons, which the topology validator already pushes back on.
 */
const polygonCacheKey = (poly: AoiPolygon): string => JSON.stringify(poly.geometry.coordinates);

/**
 * Async fetcher that returns an elevation min/max per polygon. Caches
 * results by polygon shape so editing one polygon doesn't refetch the
 * others. Concurrency is sequential to be polite to the DataBC WFS;
 * for typical 1-3 polygon AOIs the round-trip is sub-second total.
 */
const useElevationRanges = (
  aois: AoiPolygon[]
): Map<string, ElevationCellState> => {
  const [state, setState] = useState<Map<string, ElevationCellState>>(new Map());
  const cacheRef = useRef<Map<string, ElevationCellState>>(new Map());

  useEffect(() => {
    let cancelled = false;
    const keys = aois.map(polygonCacheKey);

    // Prune cache for removed polygons so it doesn't grow forever as
    // the user adds/removes during a session.
    const liveKeys = new Set(keys);
    cacheRef.current.forEach((_, k) => {
      if (!liveKeys.has(k)) cacheRef.current.delete(k);
    });

    const next = new Map(cacheRef.current);
    aois.forEach((poly) => {
      const k = polygonCacheKey(poly);
      if (!next.has(k)) next.set(k, { status: 'loading' });
    });
    setState(next);

    const run = async () => {
      for (let i = 0; i < aois.length; i += 1) {
        if (cancelled) return;
        const poly = aois[i];
        const k = polygonCacheKey(poly);
        // eslint-disable-next-line no-continue
        if (cacheRef.current.has(k) && cacheRef.current.get(k)?.status !== 'loading') continue;
        try {
          // Sequential by design — polite to the DataBC WFS (see hook doc).
          // eslint-disable-next-line no-await-in-loop
          const range = await fetchPolygonElevationRange(poly);
          if (cancelled) return;
          const cell: ElevationCellState = range
            ? { status: 'ready', range }
            : { status: 'empty' };
          cacheRef.current.set(k, cell);
          setState(new Map(cacheRef.current));
        } catch {
          if (cancelled) return;
          cacheRef.current.set(k, { status: 'error' });
          setState(new Map(cacheRef.current));
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [aois]);

  return state;
};

const formatElevationCell = (cell: ElevationCellState | undefined): string => {
  if (!cell || cell.status === 'loading') return '…';
  if (cell.status === 'empty') return '—';
  if (cell.status === 'error') return 'error';
  const { minM, maxM } = cell.range;
  if (minM === maxM) return `${formatNumber(minM, 0)} m`;
  return `${formatNumber(minM, 0)} - ${formatNumber(maxM, 0)} m`;
};

const GeomCalcPanel = () => {
  const { aois } = useSparMap();
  const elevationRanges = useElevationRanges(aois);
  // Track which polygon coordinate lists are expanded by 1-based index.
  // A Set keeps the membership check O(1) and the toggle a clean
  // immutable transform on a copy.
  const [coordsOpen, setCoordsOpen] = useState<Set<number>>(new Set());
  const toggleCoords = (idx: number) => {
    setCoordsOpen((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Compute metrics in a useMemo because the calculation walks every
  // edge of every polygon and we don't want to redo it on every parent
  // re-render. The dependency is the AOI array reference which only
  // changes when the polygon list itself changes.
  const metrics = useMemo<PolygonMetrics[]>(
    () => aois
      .map((aoi, idx) => computeMetrics(aoi, idx))
      .filter((m): m is PolygonMetrics => m !== null),
    [aois]
  );

  const totals = useMemo(() => {
    const totalAreaSqm = metrics.reduce((sum, m) => sum + m.areaSqm, 0);
    const totalPerimeterM = metrics.reduce((sum, m) => sum + m.perimeterM, 0);
    return { totalAreaSqm, totalPerimeterM };
  }, [metrics]);

  if (aois.length === 0) {
    return (
      <div className="geom-calc-panel" data-testid="geom-calc-panel">
        <Tile data-testid="geom-calc-panel-empty">
          No polygons drawn yet. Use Add Polygon in the toolbar above.
        </Tile>
      </div>
    );
  }

  const rows: GeomCalcRow[] = metrics.map((m) => {
    const ha = m.areaSqm / 10_000;
    const compass = bearingToCompass(m.longestEdgeBearingDeg);
    const aoi = aois[m.index - 1];
    const elevCell = aoi ? elevationRanges.get(polygonCacheKey(aoi)) : undefined;
    return {
      id: `geomcalc-row-${m.index}`,
      index: String(m.index),
      areaCell: `${formatNumber(ha, 2)} ha (${formatNumber(m.areaSqm, 0)} m²)`,
      perimeter: `${formatNumber(m.perimeterM, 0)} m`,
      vertices: String(m.vertexCount),
      longest: `${compass} (${formatNumber(m.longestEdgeBearingDeg, 0)}°)`,
      elevation: formatElevationCell(elevCell)
    };
  });

  const totalHa = totals.totalAreaSqm / 10_000;

  // Across-AOI elevation range — take the min of mins and max of maxes
  // of every successfully-fetched polygon. Skips loading / empty /
  // error cells. Renders as `min-max m` in the totals row when at
  // least one polygon has data.
  const overallElevationCell = (() => {
    let min: number | null = null;
    let max: number | null = null;
    aois.forEach((aoi) => {
      const cell = elevationRanges.get(polygonCacheKey(aoi));
      if (cell?.status === 'ready') {
        min = min === null ? cell.range.minM : Math.min(min, cell.range.minM);
        max = max === null ? cell.range.maxM : Math.max(max, cell.range.maxM);
      }
    });
    if (min === null || max === null) return '';
    return min === max
      ? `${formatNumber(min, 0)} m`
      : `${formatNumber(min, 0)} - ${formatNumber(max, 0)} m`;
  })();

  return (
    <div className="geom-calc-panel" data-testid="geom-calc-panel">
      <DataTable rows={rows} headers={headers}>
        {({
          rows: dtRows,
          headers: dtHeaders,
          getHeaderProps,
          getRowProps,
          getTableProps
        }: GeomCalcTableRenderProps) => (
          <TableContainer title="Polygon Geometry">
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {dtHeaders.map((header) => (
                    <TableHeader
                      {...getHeaderProps({ header })}
                      key={header.key}
                    >
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {dtRows.map((row) => (
                  <TableRow {...getRowProps({ row })} key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow data-testid="geom-calc-totals-row">
                  <TableCell>
                    <strong>Total</strong>
                  </TableCell>
                  <TableCell>
                    <strong>
                      {`${formatNumber(totalHa, 2)} ha (${formatNumber(totals.totalAreaSqm, 0)} m²)`}
                    </strong>
                  </TableCell>
                  <TableCell>
                    <strong>{`${formatNumber(totals.totalPerimeterM, 0)} m`}</strong>
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell>
                    <strong data-testid="geom-calc-total-elevation">
                      {overallElevationCell}
                    </strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
      <div className="geom-calc-panel__coords">
        {metrics.map((m) => {
          const ring = aois[m.index - 1]?.geometry?.coordinates?.[0] ?? [];
          const isOpen = coordsOpen.has(m.index);
          return (
            <div
              key={`coords-${m.index}`}
              className="geom-calc-panel__coords-row"
            >
              <Button
                kind="ghost"
                size="sm"
                renderIcon={isOpen ? ChevronUp : ChevronDown}
                onClick={() => toggleCoords(m.index)}
                data-testid={`geom-calc-coords-toggle-${m.index}`}
              >
                {`Polygon ${m.index} — ${isOpen ? 'hide' : 'show'} coordinates`}
              </Button>
              {isOpen && (
                <ol
                  className="geom-calc-panel__coords-list"
                  data-testid={`geom-calc-coords-list-${m.index}`}
                >
                  {ring.slice(0, -1).map((coord) => {
                    const [lng, lat] = coord as [number, number];
                    // Legacy aoi_panel `aoiInfo` readout
                    // (sparmap.js:680, 695, getCordinates:822-837)
                    // emitted polygon vertices as BC Albers easting,
                    // northing pairs — they're what got POSTed to the
                    // server. Show both the BC Albers and the WGS84
                    // lat/lng so operators can match either coordinate
                    // system to their notes.
                    const [easting, northing] = wgs84ToBcAlbers([lng, lat]);
                    return (
                      <li key={`v-${m.index}-${lng},${lat}`}>
                        <span className="geom-calc-panel__coord-albers">
                          {`${formatNumber(easting, 0)}, ${formatNumber(northing, 0)}`}
                        </span>
                        <span className="geom-calc-panel__coord-latlng">
                          {` (${lat.toFixed(6)}, ${lng.toFixed(6)})`}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GeomCalcPanel;
