import React, {
  useEffect, useMemo, useRef, useState
} from 'react';
import { Tile, Button } from '@carbon/react';
import { ChevronDown, ChevronUp } from '@carbon/icons-react';
import area from '@turf/area';
import length from '@turf/length';
import { lineString } from '@turf/helpers';

import { useSparMap } from '../../../../contexts/SparMapContext';
import type { AoiPolygon } from '../../../../types/SparMapTypes';
import { wgs84ToBcAlbers } from '../../../../legacy_translated/SPR_SPATIAL_UTILS';
import {
  fetchPolygonElevationRange,
  type ElevationRange
} from '../../../../api-service/elevationApi';

/**
 * GEOMCALC tool — the "Polygon statistics" panel. For every AOI in
 * `SparMapContext.aois` it renders a compact per-polygon stat block (Area,
 * Perimeter, Elevation range, Vertices) with a collapsible coordinate
 * readout. When more than one polygon is drawn, a totals block sums area +
 * perimeter and reports the overall elevation range.
 *
 * Replaces the earlier wide Carbon DataTable, which read poorly inside the
 * small floating map card. The classic CWM GEOMCALC tool only computed area
 * and perimeter; the elevation range (DataBC TRIM contours) is a React-
 * rewrite addition, and the BC Albers / WGS84 coordinate readout carries
 * over the legacy `aoi_panel` behaviour.
 *
 * Lives OUTSIDE the `<MapContainer>` — pure computation over context state.
 */

/** Number formatter — Canadian English thousands grouping. */
const formatNumber = (value: number, fractionDigits = 0): string => (Number.isFinite(value)
  ? value.toLocaleString('en-CA', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  })
  : '—');

interface PolygonMetrics {
  /** 1-based human-readable index. */
  index: number;
  /** Geodesic area in square metres. */
  areaSqm: number;
  /** Outer-ring perimeter in metres. */
  perimeterM: number;
  /** Vertex count on the outer ring (excluding the duplicated closer). */
  vertexCount: number;
}

/**
 * Compute the per-polygon metrics for a single AOI feature. Returns null
 * when the geometry can't be parsed (defensive — context state is already
 * filtered to Polygon features by AoiDrawLayer).
 */
const computeMetrics = (poly: AoiPolygon, idx: number): PolygonMetrics | null => {
  const ring = poly.geometry?.coordinates?.[0];
  if (!Array.isArray(ring) || ring.length < 4) {
    // A valid GeoJSON Polygon outer ring has at least 4 positions
    // (3 unique + the closing duplicate).
    return null;
  }

  const areaSqm = area(poly);

  // length() returns kilometres by default — convert to metres.
  const ls = lineString(ring as [number, number][]);
  const perimeterM = length(ls, { units: 'kilometers' }) * 1000;

  // Vertex count excludes the closing duplicate (first === last).
  const vertexCount = ring.length - 1;

  return {
    index: idx + 1,
    areaSqm,
    perimeterM,
    vertexCount
  };
};

type ElevationCellState =
  | { status: 'loading' }
  | { status: 'ready'; range: ElevationRange }
  | { status: 'empty' }
  | { status: 'error' };

/**
 * Stable cache key for an AOI polygon. Uses JSON.stringify of the
 * coordinates — small for typical AOIs and stable across re-renders as long
 * as the geometry is unchanged.
 */
const polygonCacheKey = (poly: AoiPolygon): string => JSON.stringify(poly.geometry.coordinates);

/**
 * Async fetcher that returns an elevation min/max per polygon. Caches
 * results by polygon shape so editing one polygon doesn't refetch the
 * others. Concurrency is sequential to be polite to the DataBC WFS.
 */
const useElevationRanges = (
  aois: AoiPolygon[]
): Map<string, ElevationCellState> => {
  const [state, setState] = useState<Map<string, ElevationCellState>>(new Map());
  const cacheRef = useRef<Map<string, ElevationCellState>>(new Map());

  useEffect(() => {
    let cancelled = false;
    const keys = aois.map(polygonCacheKey);

    // Prune cache for removed polygons so it doesn't grow forever.
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
  const [coordsOpen, setCoordsOpen] = useState<Set<number>>(new Set());
  const toggleCoords = (idx: number) => {
    setCoordsOpen((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

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

  const totalHa = totals.totalAreaSqm / 10_000;

  // Across-AOI elevation range — min of mins, max of maxes over every
  // polygon that has data. Empty string when no polygon has resolved yet.
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
      <ul className="geom-calc-panel__list">
        {metrics.map((m) => {
          const ha = m.areaSqm / 10_000;
          const aoi = aois[m.index - 1];
          const elevCell = aoi ? elevationRanges.get(polygonCacheKey(aoi)) : undefined;
          const isOpen = coordsOpen.has(m.index);
          const ring = aoi?.geometry?.coordinates?.[0] ?? [];
          return (
            <li
              key={`poly-${m.index}`}
              className="geom-calc-panel__item"
              data-testid={`geom-calc-item-${m.index}`}
            >
              <p className="geom-calc-panel__item-title">{`Polygon ${m.index}`}</p>
              <dl className="geom-calc-panel__stats">
                <div className="geom-calc-panel__stat">
                  <dt>Area</dt>
                  <dd>{`${formatNumber(ha, 2)} ha (${formatNumber(m.areaSqm, 0)} m²)`}</dd>
                </div>
                <div className="geom-calc-panel__stat">
                  <dt>Perimeter</dt>
                  <dd>{`${formatNumber(m.perimeterM, 0)} m`}</dd>
                </div>
                <div className="geom-calc-panel__stat">
                  <dt>Elevation</dt>
                  <dd data-testid={`geom-calc-elevation-${m.index}`}>
                    {formatElevationCell(elevCell)}
                  </dd>
                </div>
                <div className="geom-calc-panel__stat">
                  <dt>Vertices</dt>
                  <dd>{String(m.vertexCount)}</dd>
                </div>
              </dl>
              <Button
                kind="ghost"
                size="sm"
                renderIcon={isOpen ? ChevronUp : ChevronDown}
                onClick={() => toggleCoords(m.index)}
                data-testid={`geom-calc-coords-toggle-${m.index}`}
              >
                {`${isOpen ? 'Hide' : 'Show'} coordinates`}
              </Button>
              {isOpen && (
                <ol
                  className="geom-calc-panel__coords-list"
                  data-testid={`geom-calc-coords-list-${m.index}`}
                >
                  {ring.slice(0, -1).map((coord) => {
                    const [lng, lat] = coord as [number, number];
                    // Legacy aoi_panel emitted vertices as BC Albers
                    // easting/northing — show both so operators can match
                    // either coordinate system to their notes.
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
            </li>
          );
        })}
      </ul>
      {metrics.length > 1 && (
        <dl
          className="geom-calc-panel__stats geom-calc-panel__totals"
          data-testid="geom-calc-totals-row"
        >
          <div className="geom-calc-panel__stat">
            <dt>Total area</dt>
            <dd>{`${formatNumber(totalHa, 2)} ha (${formatNumber(totals.totalAreaSqm, 0)} m²)`}</dd>
          </div>
          <div className="geom-calc-panel__stat">
            <dt>Total perimeter</dt>
            <dd>{`${formatNumber(totals.totalPerimeterM, 0)} m`}</dd>
          </div>
          <div className="geom-calc-panel__stat">
            <dt>Elevation (all)</dt>
            <dd data-testid="geom-calc-total-elevation">{overallElevationCell || '—'}</dd>
          </div>
        </dl>
      )}
    </div>
  );
};

export default GeomCalcPanel;
