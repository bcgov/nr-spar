import {
  useEffect, useRef, useState, useCallback
} from 'react';
import { useMap, useMapEvent } from 'react-leaflet';
import L from 'leaflet';
import length from '@turf/length';
import area from '@turf/area';
import { lineString, polygon as turfPolygon } from '@turf/helpers';

import { useSparMap } from '../../../../contexts/SparMapContext';

/**
 * Click-based measurement tool. Mounted INSIDE `<MapContainer>` like
 * `BecIdentifyLayer` and `AoiDrawLayer`. Mirrors the legacy CWM
 * `Measurement` module (`cwmc-lib/v1.7.2/CWM.js:9514`) which exposes
 * three explicit modes plus a clear action:
 *
 * - **distance** (linestring) — click vertices, double-click to finish.
 *   Reports total `distanceKm`.
 * - **area** (polygon) — click vertices, double-click to finish.
 *   Auto-closes the ring. Reports `areaSqm` plus closed-ring
 *   `perimeterKm`.
 * - **point** — single click drops a marker. Reports `pointLat` /
 *   `pointLng`.
 *
 * Mode + results flow through `SparMapContext`: the
 * `MeasurementToolsPanel` writes `measurementMode`; this component
 * watches it and starts the matching click flow. After each click /
 * dblclick we push `measurementResult` back to context so the panel can
 * display the running numbers.
 *
 * Measurement layers live in a private `L.layerGroup()` added directly
 * to the map — they are NOT registered with Geoman, so they don't
 * pollute `map.pm.getGeomanLayers()` and won't be picked up by
 * AoiDrawLayer's rebuildFromMap.
 */
const MeasureControl = () => {
  const map = useMap();
  const {
    measurementMode,
    setMeasurementMode,
    setMeasurementResult,
    _setMapControls
  } = useSparMap();

  const [, setPoints] = useState<L.LatLng[]>([]);
  const layerGroupRef = useRef<L.LayerGroup>(L.layerGroup());

  // Cache the current mode in a ref so the click handlers (which close
  // over the initial mode value via the React closure) always read the
  // latest value without needing useMapEvent re-binding.
  const modeRef = useRef<'distance' | 'area' | 'point' | null>(null);
  modeRef.current = measurementMode;

  // True once a distance/area measurement has been finished by a
  // double-click. The next single-click then starts a fresh measurement
  // instead of extending the finished one (the tool stays armed).
  const finishedRef = useRef(false);

  const formatDistanceKm = useCallback((km: number): string => {
    if (!Number.isFinite(km) || km <= 0) return '0 m';
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(2)} km`;
  }, []);

  const cumulativeDistanceKm = useCallback((pts: L.LatLng[]): number => {
    if (pts.length < 2) return 0;
    const coords = pts.map((p) => [p.lng, p.lat] as [number, number]);
    return length(lineString(coords), { units: 'kilometers' });
  }, []);

  const perimeterKm = useCallback((pts: L.LatLng[]): number => {
    if (pts.length < 3) return 0;
    const coords = pts.map((p) => [p.lng, p.lat] as [number, number]);
    const first = coords[0];
    coords.push(first);
    return length(lineString(coords), { units: 'kilometers' });
  }, []);

  const ringAreaSqm = useCallback((pts: L.LatLng[]): number => {
    if (pts.length < 3) return 0;
    const coords = pts.map((p) => [p.lng, p.lat] as [number, number]);
    const first = coords[0];
    const last = coords[coords.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) coords.push(first);
    try {
      return area(turfPolygon([coords]));
    } catch {
      return 0;
    }
  }, []);

  /**
   * Render the in-progress / finished measurement layers and push the
   * latest numeric result back to context so the panel can show it.
   */
  const renderMeasurement = useCallback(
    (pts: L.LatLng[], mode: 'distance' | 'area' | 'point', finished: boolean) => {
      const group = layerGroupRef.current;
      group.clearLayers();
      if (pts.length === 0) return;

      if (mode === 'point') {
        const pt = pts[pts.length - 1];
        const marker = L.circleMarker(pt, {
          radius: 6,
          color: '#0f62fe',
          weight: 2,
          fillColor: '#ffffff',
          fillOpacity: 1
        });
        marker.bindTooltip(
          `${pt.lat.toFixed(5)}, ${pt.lng.toFixed(5)}`,
          { permanent: true, direction: 'right', offset: [10, 0] }
        );
        group.addLayer(marker);
        setMeasurementResult({ pointLat: pt.lat, pointLng: pt.lng });
        return;
      }

      // Polyline (always shown in distance + area modes)
      if (pts.length >= 2) {
        const polyline = L.polyline(pts, {
          color: '#0f62fe',
          weight: 3,
          dashArray: '6 6'
        });
        group.addLayer(polyline);
      }

      // Area mode + finished + 3+ pts → translucent fill
      if (mode === 'area' && finished && pts.length >= 3) {
        try {
          const poly = L.polygon(pts, {
            color: '#0f62fe',
            weight: 2,
            dashArray: '6 6',
            fillColor: '#0f62fe',
            fillOpacity: 0.15
          });
          group.addLayer(poly);
        } catch {
          // self-intersecting — skip
        }
      }

      // Per-vertex markers + cumulative-distance tooltip
      pts.forEach((pt, idx) => {
        const marker = L.circleMarker(pt, {
          radius: 4,
          color: '#0f62fe',
          weight: 2,
          fillColor: '#ffffff',
          fillOpacity: 1
        });
        const cumKm = cumulativeDistanceKm(pts.slice(0, idx + 1));
        marker.bindTooltip(formatDistanceKm(cumKm), {
          permanent: true,
          direction: 'top',
          offset: [0, -6],
          className: 'spar-measure-vertex-tooltip'
        });
        group.addLayer(marker);
      });

      // Compute + publish numeric result
      if (mode === 'distance') {
        setMeasurementResult({ distanceKm: cumulativeDistanceKm(pts) });
        // mode === 'area'
      } else if (finished && pts.length >= 3) {
        setMeasurementResult({
          areaSqm: ringAreaSqm(pts),
          perimeterKm: perimeterKm(pts)
        });
      } else {
        // In-progress area: show running perimeter (open-line length)
        setMeasurementResult({
          perimeterKm: cumulativeDistanceKm(pts)
        });
      }
    },
    [
      cumulativeDistanceKm,
      perimeterKm,
      ringAreaSqm,
      formatDistanceKm,
      setMeasurementResult
    ]
  );

  // Mount the layer group on the underlying map once.
  useEffect(() => {
    if (!map) return undefined;
    const group = layerGroupRef.current;
    group.addTo(map);
    return () => {
      group.clearLayers();
      group.removeFrom(map);
    };
  }, [map]);

  // When the active mode changes, reset in-progress state. A switch
  // (e.g. distance → area) wipes any previous measurement so the user
  // starts fresh; switching to null clears everything.
  useEffect(() => {
    setPoints([]);
    layerGroupRef.current.clearLayers();
    setMeasurementResult(null);
    finishedRef.current = false;
  }, [measurementMode, setMeasurementResult]);

  // Single-click extends the measurement (or drops the point in point
  // mode). The mode ref keeps this read-up-to-date without re-binding
  // the useMapEvent.
  useMapEvent('click', (e) => {
    const mode = modeRef.current;
    if (!mode) return;
    if (mode === 'point') {
      setPoints([e.latlng]);
      renderMeasurement([e.latlng], 'point', true);
      return;
    }
    setPoints((prev) => {
      // After a double-click finish, the next click starts a fresh
      // measurement rather than extending the locked one.
      const base = finishedRef.current ? [] : prev;
      finishedRef.current = false;
      const next = [...base, e.latlng];
      renderMeasurement(next, mode, false);
      return next;
    });
  });

  // Double-click finishes the distance / area measurement. The tool stays
  // armed (mode active); the next click starts a new measurement.
  useMapEvent('dblclick', () => {
    const mode = modeRef.current;
    if (!mode || mode === 'point') return;
    finishedRef.current = true;
    setPoints((prev) => {
      // A double-click fires two 'click' events first, both at the finish
      // point — drop the duplicate vertex they added before finishing.
      let pts = prev;
      if (pts.length >= 2 && pts[pts.length - 1].equals(pts[pts.length - 2], 1e-6)) {
        pts = pts.slice(0, -1);
      }
      if (pts.length >= 2) renderMeasurement(pts, mode, true);
      return pts;
    });
  });

  // Suppress the map's double-click zoom while measuring + crosshair
  // cursor. Restore on mode-clear.
  useEffect(() => {
    if (!map) return undefined;
    const active = measurementMode !== null;
    // Leaflet stores the map's DOM node on the private `_container` field;
    // there is no public accessor, so reach into the library internal.
    // eslint-disable-next-line no-underscore-dangle
    const container = (map as unknown as { _container?: HTMLElement })._container;
    if (active) {
      map.doubleClickZoom?.disable();
      if (container) container.style.cursor = 'crosshair';
    } else {
      map.doubleClickZoom?.enable();
      if (container) container.style.cursor = '';
    }
    return () => {
      map.doubleClickZoom?.enable();
      if (container) container.style.cursor = '';
    };
  }, [map, measurementMode]);

  // Backward-compat bridge for callers still using the old MapControls
  // `startMeasure` / `clearMeasure` API (e.g. legacy MapToolbar code).
  // `startMeasure` defaults to distance mode (legacy single-button
  // behaviour); `clearMeasure` wipes everything.
  useEffect(() => {
    if (!_setMapControls) return undefined;
    _setMapControls({
      startMeasure: () => setMeasurementMode('distance'),
      clearMeasure: () => setMeasurementMode(null)
    });
    return () => {
      _setMapControls({ startMeasure: null, clearMeasure: null });
    };
  }, [_setMapControls, setMeasurementMode]);

  return null;
};

export default MeasureControl;
