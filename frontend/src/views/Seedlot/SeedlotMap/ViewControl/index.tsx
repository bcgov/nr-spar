import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';

import { useSparMap } from '../../../../contexts/SparMapContext';

interface ViewSnapshot {
  center: [number, number];
  zoom: number;
}

/**
 * Max view history entries — caps memory while still feeling unlimited
 *  for typical sessions (a panning user might generate ~30-50 entries).
 */
const MAX_HISTORY = 50;

/**
 * Full-province bounds for British Columbia. Mirrors the COLAREA theme's
 * `defaultExtent` and is the target for the legacy CWM `ZOOM_BC` tool.
 */
export const BC_BOUNDS: LatLngBoundsExpression = [
  [48.3, -139.0],
  [60.0, -114.0]
];

interface ViewControlProps {
  /**
   * The initial bounds the map was loaded with — either the URL-supplied
   * `?extent=` value or the active theme profile's `defaultExtent`. Used
   * to power the legacy CWM `ZOOM_EXTENT` tool. Passed in by LeafletMap
   * so ViewControl doesn't need to know about themes.
   */
  initialBounds: LatLngBoundsExpression;
}

/**
 * Registers map-wide view manipulation callbacks with the SparMapContext
 * bridge so components outside `<MapContainer>` — `<SearchControl>` and
 * `<BookmarksPanel>` — can read and write the current Leaflet view
 * without needing access to `useMap()`.
 *
 * Follows the same side-effect-only pattern as `<MeasureControl>`: mounts
 * inside the MapContainer tree, wires callbacks into context via
 * `_setMapControls`, and renders nothing. The `return () => { … }`
 * cleanup nulls the callbacks on unmount so stale references can't fire
 * after the map tears down.
 */
const ViewControl = ({ initialBounds }: ViewControlProps) => {
  const map = useMap();
  const { _setMapControls, _setViewHistoryAvailability } = useSparMap();
  // Mirror the legacy CWM ZOOM_HISTORY tool: stack of past map views,
  // current pointer, and a flag so programmatic setView/flyTo from
  // back/forward navigation doesn't recursively push a new entry.
  const historyRef = useRef<ViewSnapshot[]>([]);
  const indexRef = useRef(-1);
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    if (!map || !_setMapControls) return undefined;

    const snapshot = (): ViewSnapshot => {
      const c = map.getCenter();
      return { center: [c.lat, c.lng], zoom: map.getZoom() };
    };

    const publishAvailability = () => {
      _setViewHistoryAvailability({
        canGoBack: indexRef.current > 0,
        canGoForward: indexRef.current < historyRef.current.length - 1
      });
    };

    const recordView = () => {
      if (isNavigatingRef.current) {
        // Was a programmatic navigation — just clear the flag, don't push.
        isNavigatingRef.current = false;
        publishAvailability();
        return;
      }
      const snap = snapshot();
      const last = historyRef.current[indexRef.current];
      if (
        last
        && last.zoom === snap.zoom
        && last.center[0] === snap.center[0]
        && last.center[1] === snap.center[1]
      ) {
        return;
      }
      // Drop the forward chain whenever the user pans/zooms while not
      // at the tip — mirrors browser history semantics.
      historyRef.current = historyRef.current.slice(0, indexRef.current + 1);
      historyRef.current.push(snap);
      if (historyRef.current.length > MAX_HISTORY) {
        historyRef.current = historyRef.current.slice(-MAX_HISTORY);
      }
      indexRef.current = historyRef.current.length - 1;
      publishAvailability();
    };

    const goBack = () => {
      if (indexRef.current <= 0) return;
      indexRef.current -= 1;
      const target = historyRef.current[indexRef.current];
      isNavigatingRef.current = true;
      map.setView(target.center, target.zoom, { animate: false });
      publishAvailability();
    };

    const goForward = () => {
      if (indexRef.current >= historyRef.current.length - 1) return;
      indexRef.current += 1;
      const target = historyRef.current[indexRef.current];
      isNavigatingRef.current = true;
      map.setView(target.center, target.zoom, { animate: false });
      publishAvailability();
    };

    // Seed the history with the initial view so the first user move
    // gives us a "back" target.
    historyRef.current = [snapshot()];
    indexRef.current = 0;
    publishAvailability();

    map.on('moveend zoomend', recordView);

    _setMapControls({
      flyToLocation: (lat: number, lng: number, zoom = 14) => {
        map.flyTo([lat, lng], zoom);
      },
      getCurrentView: () => {
        const center = map.getCenter();
        return {
          center: [center.lat, center.lng] as [number, number],
          zoom: map.getZoom()
        };
      },
      restoreView: (center: [number, number], zoom: number) => {
        map.setView(center, zoom);
      },
      zoomToBC: () => {
        map.fitBounds(BC_BOUNDS, { animate: false });
      },
      zoomToInitialExtent: () => {
        map.fitBounds(initialBounds, { animate: false });
      },
      goBackView: goBack,
      goForwardView: goForward
    });

    return () => {
      map.off('moveend zoomend', recordView);
      _setMapControls({
        flyToLocation: null,
        getCurrentView: null,
        restoreView: null,
        zoomToBC: null,
        zoomToInitialExtent: null,
        goBackView: null,
        goForwardView: null
      });
      _setViewHistoryAvailability({ canGoBack: false, canGoForward: false });
    };
  }, [map, _setMapControls, _setViewHistoryAvailability, initialBounds]);

  return null;
};

export default ViewControl;
