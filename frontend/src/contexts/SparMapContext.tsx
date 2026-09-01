import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import type { LatLngBoundsExpression } from 'leaflet';
import type { AoiPolygon } from '../types/SparMapTypes';
import type { LegendOverlayData } from '../api-service/legendApi';

export interface MarkupPointCoordinate {
  lat: number;
  lng: number;
}

/**
 * Callbacks registered by in-map components (e.g. `<AoiDrawLayer>`,
 * `<MeasureControl>`) so that sibling components rendered OUTSIDE the
 * `<MapContainer>` — and which therefore can't call `useMap()` directly —
 * can still trigger Leaflet/Geoman operations on the live map. See
 * `AoiDrawLayer/index.tsx` and `MeasureControl/index.tsx` for the wiring.
 */
export interface MapControls {
  startDraw: () => void;
  startEdit: () => void;
  /**
   * Enable Geoman global removal mode — the next polygon the user clicks
   * is deleted (fires pm:remove, which rebuilds AOI state). Backs the
   * "Delete Polygon" toolbar button. Mutually exclusive with draw/edit.
   */
  startRemovalMode: () => void;
  clearMapLayers: () => void;
  /** Disable any active AOI draw/edit mode without removing AOI layers. */
  cancelAoiMode: (() => void) | null;
  /**
   * Render an array of imported polygons as Geoman-visible layers on the
   * map. Registered by `<AoiDrawLayer>` so `<AoiToolbar>` can drop shapes
   * from a parsed KML/KMZ/Shapefile onto the live map without reaching
   * across the MapContainer boundary. See Phase 3 import wiring.
   */
  addImportedLayersToMap: (polygons: AoiPolygon[]) => void;
  /**
   * Activates the click-based measurement mode. Registered by
   * `<MeasureControl>`. Once active, single-clicking on the map adds
   * vertices to a measurement line; double-clicking finishes it.
   * Null until the control mounts.
   */
  startMeasure: (() => void) | null;
  /**
   * Removes any active measurement layers and resets the measurement
   * state. Registered by `<MeasureControl>`. Null until the control
   * mounts.
   */
  clearMeasure: (() => void) | null;
  /**
   * Activates the CWM Markup "Draw Point" behavior. Without coordinates,
   * the next map click drops a red star-style point marker. With
   * coordinates, a marker is placed immediately. Registered by
   * `<MarkupPointLayer>`. Null until the control mounts.
   */
  startDrawPoint: ((coordinate?: MarkupPointCoordinate) => void) | null;
  /**
   * Removes user-created markup points from the map. Registered by
   * `<MarkupPointLayer>`. Null until the control mounts.
   */
  clearMarkupPoints: (() => void) | null;
  /** Cancel a pending click-to-place markup point without deleting markers. */
  cancelDrawPoint: (() => void) | null;
  /**
   * Removes the most recently drawn/imported Geoman layer from the map
   * (matches "Clear Last Polygon" in the AOI toolbar). Registered by
   * `<AoiDrawLayer>` which has direct access to the map instance and
   * can call `map.pm.getGeomanLayers()` reliably — the toolbar can't
   * access that API because it's rendered outside the MapContainer.
   * Null until `<AoiDrawLayer>` mounts.
   */
  removeLastMapLayer: (() => void) | null;
  /**
   * Fly the map to the given WGS84 lat/lng and (optionally) a specific
   * zoom level. Registered by `<ViewControl>`; consumed by
   * `<SearchControl>` when the user picks a geocoder result. Null until
   * the control mounts — callers should guard with `?.()`.
   */
  flyToLocation: ((lat: number, lng: number, zoom?: number) => void) | null;
  /**
   * Snapshot the current Leaflet center + zoom for bookmarking. Returns
   * null when the map handle is not yet available. Registered by
   * `<ViewControl>`; consumed by `<BookmarksPanel>`.
   */
  getCurrentView:
    | (() => { center: [number, number]; zoom: number } | null)
    | null;
  /**
   * Jump the map back to a previously captured view without a fly
   * animation (bookmark restores should feel instantaneous). Registered
   * by `<ViewControl>`; consumed by `<BookmarksPanel>`.
   */
  restoreView: ((center: [number, number], zoom: number) => void) | null;
  /**
   * Fit the map to the full British Columbia bounds. Used by the legacy
   * CWM `ZOOM_BC` toolbar tool. Registered by `<ViewControl>`. Null until
   * mounted.
   */
  zoomToBC: (() => void) | null;
  /**
   * Fit the map back to the initial extent it was loaded with — either
   * the URL-supplied `?extent=` bounds or the active theme profile's
   * `defaultExtent`. Mirrors the legacy CWM `ZOOM_EXTENT` tool. Registered
   * by `<ViewControl>`. Null until mounted.
   */
  zoomToInitialExtent: (() => void) | null;
  /**
   * Enable Geoman rectangle draw mode. Result is a Polygon that joins
   * the AOI list via the existing `pm:create` handler. Mirrors the
   * legacy CWM AOI_RECTANGLE tool. Registered by `<AoiDrawLayer>`.
   */
  startDrawRectangle: (() => void) | null;
  /**
   * Enable Geoman circle draw mode. Geoman converts the circle to a
   * polygon approximation on completion, so it flows through the same
   * AOI pipeline as freehand polygons. Mirrors AOI_CIRCLE.
   */
  startDrawCircle: (() => void) | null;
  /**
   * Enable Geoman polyline draw mode. The result is a LineString, NOT a
   * Polygon — the existing `rebuildFromMap` filter drops non-polygons
   * from the AOI list, so lines are visual-only on the map. Mirrors
   * the legacy CWM AOI_LINE markup tool.
   */
  startDrawLine: (() => void) | null;
  /**
   * Fit the map to the union bounds of every drawn/imported AOI polygon.
   * Legacy CWM AOI_ZOOM. Registered by `<AoiDrawLayer>` which has direct
   * access to the map handle. Null until ready.
   */
  zoomToAois: (() => void) | null;
  /**
   * Fetch a BEC zone polygon by MAP_LABEL, highlight it on the map, and
   * zoom-to-fit its bounds. Used by the AOUCBST/PLANTSITECBST side
   * panel's clickable BEC zone rows — mirrors the legacy
   * `Sparmap.showBECFeatureInfoOnMapByBecCode` (sparmap.js:130-174).
   * Registered by `<BecHighlightLayer>` which has direct access to the
   * Leaflet map handle. Null until the layer mounts.
   */
  zoomToBecZone: ((mapLabel: string) => Promise<void>) | null;
  /**
   * Step the map back to the previous entry in the view history (legacy
   * CWM `GO_BACK` tool). Registered by `<ViewControl>`, which owns the
   * undo/redo view stack. Null until the control mounts.
   */
  goBackView: (() => void) | null;
  /**
   * Step the map forward to the next entry in the view history (legacy
   * CWM `GO_FORWARD` tool). Registered by `<ViewControl>`. Null until the
   * control mounts.
   */
  goForwardView: (() => void) | null;
}

const NOOP_MAP_CONTROLS: MapControls = {
  startDraw: () => {},
  startEdit: () => {},
  startRemovalMode: () => {},
  clearMapLayers: () => {},
  cancelAoiMode: null,
  addImportedLayersToMap: () => {},
  startMeasure: null,
  clearMeasure: null,
  startDrawPoint: null,
  clearMarkupPoints: null,
  cancelDrawPoint: null,
  removeLastMapLayer: null,
  flyToLocation: null,
  getCurrentView: null,
  restoreView: null,
  zoomToBC: null,
  zoomToInitialExtent: null,
  startDrawRectangle: null,
  startDrawCircle: null,
  startDrawLine: null,
  zoomToAois: null,
  zoomToBecZone: null,
  goBackView: null,
  goForwardView: null
};

interface SparMapContextValue {
  /**
   * Array of user-drawn AOI polygons. Mirrors the legacy SPAR multi-polygon
   * flow from `sparmap.js Sparmap.aoi.*` where users could draw more than
   * one polygon before submitting.
   */
  aois: AoiPolygon[];
  /** Append a single freshly-drawn polygon to the AOI list. */
  addAoi: (aoi: AoiPolygon) => void;
  /** Remove the most recently added polygon (maps to legacy Clear Last). */
  removeLastAoi: () => void;
  /** Wipe the AOI list (maps to legacy Clear All). */
  clearAois: () => void;
  /**
   * Replace the polygon at the given index — used when Geoman edits mutate
   * an existing layer and we rebuild the AOI list from the map's layer set.
   */
  replaceAoi: (index: number, aoi: AoiPolygon) => void;
  /**
   * Atomically replace the entire AOI list — used by the AoiDrawLayer edit
   * handler to sync context state with the map's Geoman layers after a
   * user finishes editing a polygon.
   */
  setAois: (aois: AoiPolygon[]) => void;

  /** BEC zone codes shown in the side panel (AOUCBST theme). */
  becZoneCodes: string[];
  /** Subset of becZoneCodes that are marked "not suitable" for the species. */
  becNotSuit: string[];
  /** Whether becZoneCodes filter should target ZONE or MAP_LABEL. */
  becZoneShape: 'zone' | 'mapLabel';
  setBecZones: (codes: string[], notSuit: string[], shape?: 'zone' | 'mapLabel') => void;

  /**
   * Bounds parsed from the legacy `extent=minX,minY,maxX,maxY` URL param
   * (BC Albers, reprojected to WGS84 lat/lng for Leaflet). Null when the
   * URL didn't supply an extent — the map falls back to the theme profile's
   * `defaultExtent`. Mirrors legacy SPAR's per-link map starting view.
   */
  extentBounds: LatLngBoundsExpression | null;
  /** Set or clear the URL-driven map extent. */
  setExtentBounds: (bounds: LatLngBoundsExpression | null) => void;

  /**
   * Seedlot number from the legacy `seedlot=` URL param. Renders a red
   * point on the map via the seedlot-point WMS layer. Mutually exclusive
   * with `veglotNumber` — when both are provided, seedlot wins (legacy
   * convention).
   */
  seedlotNumber: string | null;
  /**
   * Veglot number from the legacy `veglot=` URL param. Renders a red
   * point on the map via the veglot-point WMS layer. Ignored when
   * `seedlotNumber` is set.
   */
  veglotNumber: string | null;
  /**
   * Set the highlighted point. Pass either a seedlot or a veglot number;
   * pass null/null to clear. Enforces mutual exclusivity at the setter
   * boundary so consumers can't accidentally drive both layers on at once.
   */
  setHighlightPoint: (
    seedlot: string | null,
    veglot: string | null
  ) => void;

  /**
   * SEED_PLAN_ZONE_ID values from the legacy `spzid=` CSV URL param.
   * Drives the SPZ highlight overlay. Empty array means no SPZ is
   * highlighted — the layer self-gates and renders nothing.
   */
  spzIds: number[];
  /** Replace the SPZ highlight ID list. */
  setSpzIds: (ids: number[]) => void;

  /**
   * Per-parity placeholder for the legacy `spz=` URL param (string code
   * like "M"). Stored for future use; currently no overlay reads it.
   */
  spzCode: string | null;
  setSpzCode: (code: string | null) => void;

  /**
   * Per-parity placeholder for the legacy `species=` URL param (e.g. "FDC").
   * Stored for future use; currently no overlay reads it. The legacy map
   * used this to toggle per-species layer visibility via fragile string
   * matching — out of scope for this POC.
   */
  speciesCode: string | null;
  setSpeciesCode: (code: string | null) => void;

  // Map control bridge — in-map components (AoiDrawLayer, MeasureControl)
  // register these on mount; sibling toolbars invoke them. The toolbar
  // gates UI on presence (null means the feature isn't ready yet) so
  // buttons can be safely disabled until the corresponding in-map
  // component has mounted.
  startDraw: () => void;
  startEdit: () => void;
  /** Enable Geoman removal mode — click a polygon to delete it. */
  startRemovalMode: () => void;
  clearMapLayers: () => void;
  /** Disable any active AOI draw/edit mode without removing AOI layers. */
  cancelAoiMode: (() => void) | null;
  /**
   * Add imported polygon features (from KML/KMZ/Shapefile) to the live
   * Leaflet map as Geoman-editable layers. Phase 3 wiring — registered
   * by `<AoiDrawLayer>` alongside the other map control callbacks.
   */
  addImportedLayersToMap: (polygons: AoiPolygon[]) => void;
  /** Begin click-based distance/area measurement. Null until ready. */
  startMeasure: (() => void) | null;
  /** Erase any current measurement layers + reset state. Null until ready. */
  clearMeasure: (() => void) | null;
  /** Begin CWM-style Markup Draw Point mode. Null until ready. */
  startDrawPoint: ((coordinate?: MarkupPointCoordinate) => void) | null;
  /** Clear all user-created markup points. Null until ready. */
  clearMarkupPoints: (() => void) | null;
  /** Cancel a pending click-to-place markup point without deleting markers. */
  cancelDrawPoint: (() => void) | null;
  /**
   * Remove the most recently drawn/imported polygon from the map.
   * Null until `<AoiDrawLayer>` mounts. Used by the AOI toolbar's
   * "Clear Last" button.
   */
  removeLastMapLayer: (() => void) | null;
  /**
   * Fly to a WGS84 location at a given zoom level. Null until the
   * `<ViewControl>` component mounts inside the MapContainer.
   * Used by `<SearchControl>` to pan to a geocoder hit.
   */
  flyToLocation: ((lat: number, lng: number, zoom?: number) => void) | null;
  /**
   * Read the current map center + zoom (for saving a bookmark). Null
   * until ready. Used by `<BookmarksPanel>`.
   */
  getCurrentView:
    | (() => { center: [number, number]; zoom: number } | null)
    | null;
  /**
   * Jump the map to a captured bookmark view. Null until ready. Used
   * by `<BookmarksPanel>`.
   */
  restoreView: ((center: [number, number], zoom: number) => void) | null;
  /** Fit the map to the full British Columbia bounds (legacy ZOOM_BC). */
  zoomToBC: (() => void) | null;
  /** Fit the map back to its initial extent (URL extent or theme default). */
  zoomToInitialExtent: (() => void) | null;
  /** Enable Geoman rectangle draw mode (legacy AOI_RECTANGLE). */
  startDrawRectangle: (() => void) | null;
  /** Enable Geoman circle draw mode (legacy AOI_CIRCLE). */
  startDrawCircle: (() => void) | null;
  /** Enable Geoman polyline draw mode (legacy AOI_LINE — visual only). */
  startDrawLine: (() => void) | null;
  /** Fit the map to the union bounds of the AOI list (legacy AOI_ZOOM). */
  zoomToAois: (() => void) | null;
  /**
   * AOUCBST BEC zone side-panel click-to-zoom — fetches the polygon for
   * `mapLabel` (e.g. `IDFmw1`) and pans/zooms to it. Mirrors legacy
   * `Sparmap.showBECFeatureInfoOnMapByBecCode`.
   */
  zoomToBecZone: ((mapLabel: string) => Promise<void>) | null;
  /** Map view-history navigation (legacy ZOOM_HISTORY). */
  goBackView: (() => void) | null;
  goForwardView: (() => void) | null;
  /** Whether the view history can navigate back / forward right now. */
  canGoBack: boolean;
  canGoForward: boolean;
  /** Setter consumed by `<ViewControl>` after every view-history mutation. */
  _setViewHistoryAvailability: (state: { canGoBack: boolean; canGoForward: boolean }) => void;

  /**
   * True when the user has activated the Identify tool via the AOI
   * toolbar. `<BecIdentifyLayer>` only reacts to map clicks when this
   * flag is set, so clicks in normal draw/measure modes don't
   * accidentally trigger a WFS GetFeature request.
   */
  identifyActive: boolean;
  /** Toggle or set the Identify mode active state. */
  setIdentifyActive: (active: boolean) => void;

  /**
   * IDs of BCGW catalog layers currently toggled on by the user via the
   * Layer Catalog Modal. Session-only — not persisted. LeafletMap reads
   * this to render dynamic WMSTileLayer overlays.
   */
  activeCatalogLayers: string[];
  /** Add or remove a BCGW catalog layer by ID. */
  toggleCatalogLayer: (id: string) => void;

  /**
   * Dynamic legend entries for the overlays currently visible in the map
   * view. Produced by `<LegendDataLayer>` (GeoServer JSON legend, trimmed
   * to the viewport via hideEmptyRules) and rendered by `<LegendPanel>`.
   * Empty when no legend-eligible overlay has symbols in the current view.
   */
  legendData: LegendOverlayData[];
  /** Replace the dynamic legend entries. Called by `<LegendDataLayer>`. */
  setLegendData: (data: LegendOverlayData[]) => void;

  /**
   * When true, `<GraticuleLayer>` renders a lat/lng grid overlay on the
   * map. Toggle via the AoiToolbar/MapToolbar GRATICULE button. Mirrors
   * the legacy CWM GRATICULE tool from map-config.json.
   */
  graticuleVisible: boolean;
  /** Toggle the graticule overlay on/off. */
  setGraticuleVisible: (visible: boolean) => void;

  /**
   * Latest live AOI topology validation result, kept in sync by
   * `<AoiDrawLayer>` after every `pm:create` / `pm:edit` / `pm:remove`.
   * Mirrors the legacy SPAR `addPoint` flow which POST'd to the server
   * on every vertex add to validate the in-progress polygon. Null
   * means "no AOI to validate" (empty list). Non-null with `ok: false`
   * surfaces an inline warning in the AOI toolbar.
   */
  liveAoiValidation: { ok: boolean; message: string } | null;
  setLiveAoiValidation: (result: { ok: boolean; message: string } | null) => void;

  /**
   * Active mode for the legacy CWM Measurement Tools panel. Mirrors the
   * `Measurement.LinestringMode | PolygonMode | PointMode` constants
   * from `cwmc-lib/v1.7.2/CWM.js`. The `MeasurementToolsPanel` writes
   * this on button click; `<MeasureControl>` watches it and starts /
   * stops the corresponding click flow. Null means measurement is
   * inactive.
   */
  measurementMode: 'distance' | 'area' | 'point' | null;
  setMeasurementMode: (mode: 'distance' | 'area' | 'point' | null) => void;

  /**
   * Latest measurement readouts, written by `<MeasureControl>` after
   * each click/dblclick. The panel reads these to populate its
   * Distance / Perimeter / Area / Point coordinate fields. Null means
   * no measurement has been taken yet (or the user cleared it).
   */
  measurementResult: {
    distanceKm?: number;
    perimeterKm?: number;
    areaSqm?: number;
    pointLat?: number;
    pointLng?: number;
  } | null;
  setMeasurementResult: (
    result:
      | {
          distanceKm?: number;
          perimeterKm?: number;
          areaSqm?: number;
          pointLat?: number;
          pointLng?: number;
        }
      | null
  ) => void;

  /**
   * Registers a partial slice of map control callbacks. Both
   * `<AoiDrawLayer>` and `<MeasureControl>` call this independently;
   * the provider merges the partial into existing state so the two
   * components don't clobber each other. The leading underscore marks
   * this as an internal bridge, not user-facing state.
   */
  _setMapControls: (controls: Partial<MapControls>) => void;
}

const SparMapContext = createContext<SparMapContextValue | undefined>(undefined);

/**
 * Provider for the in-progress SPAR map state (multi-polygon AOI list,
 * BEC zone codes for the side panel, and a map control bridge to let
 * `<AoiToolbar>` trigger Geoman operations). Wraps the `<SeedlotMap>` view
 * so child components like `<AoiDrawLayer>` can push Geoman events into
 * shared state without prop-drilling.
 *
 * All setter functions are wrapped in `useCallback` so consumers can
 * safely put them in `useEffect` dependency arrays without triggering
 * infinite re-render loops. Task 16 burned on this exact bug with the
 * single-polygon implementation — don't re-introduce it.
 */
export const SparMapProvider = ({ children }: { children: ReactNode }) => {
  const [aois, setAoisState] = useState<AoiPolygon[]>([]);
  const [becZoneCodes, setBecZoneCodes] = useState<string[]>([]);
  const [becNotSuit, setBecNotSuit] = useState<string[]>([]);
  const [becZoneShape, setBecZoneShape] = useState<'zone' | 'mapLabel'>('zone');
  const [mapControls, setMapControlsState] = useState<MapControls>(NOOP_MAP_CONTROLS);
  const [identifyActive, setIdentifyActiveState] = useState(false);
  const [activeCatalogLayers, setActiveCatalogLayers] = useState<string[]>([]);
  const [legendData, setLegendData] = useState<LegendOverlayData[]>([]);
  const [graticuleVisible, setGraticuleVisibleState] = useState(false);
  const setGraticuleVisible = useCallback((visible: boolean) => {
    setGraticuleVisibleState(visible);
  }, []);
  const [liveAoiValidation, setLiveAoiValidationState] = useState<
    { ok: boolean; message: string } | null
  >(null);
  const setLiveAoiValidation = useCallback(
    (result: { ok: boolean; message: string } | null) => {
      setLiveAoiValidationState(result);
    },
    []
  );
  const [measurementMode, setMeasurementModeState] = useState<
    'distance' | 'area' | 'point' | null
  >(null);
  const setMeasurementMode = useCallback(
    (mode: 'distance' | 'area' | 'point' | null) => {
      setMeasurementModeState(mode);
    },
    []
  );
  const [measurementResult, setMeasurementResultState] = useState<
    | {
        distanceKm?: number;
        perimeterKm?: number;
        areaSqm?: number;
        pointLat?: number;
        pointLng?: number;
      }
    | null
  >(null);
  const setMeasurementResult = useCallback(
    (
      result:
        | {
            distanceKm?: number;
            perimeterKm?: number;
            areaSqm?: number;
            pointLat?: number;
            pointLng?: number;
          }
        | null
    ) => {
      setMeasurementResultState(result);
    },
    []
  );
  const [viewHistoryAvail, setViewHistoryAvail] = useState({
    canGoBack: false,
    canGoForward: false
  });
  // eslint-disable-next-line no-underscore-dangle -- internal bridge setter, not public API
  const _setViewHistoryAvailability = useCallback(
    (state: { canGoBack: boolean; canGoForward: boolean }) => {
      setViewHistoryAvail(state);
    },
    []
  );
  const [extentBounds, setExtentBoundsState] = useState<LatLngBoundsExpression | null>(null);
  const [seedlotNumber, setSeedlotNumberState] = useState<string | null>(null);
  const [veglotNumber, setVeglotNumberState] = useState<string | null>(null);
  const [spzIds, setSpzIdsState] = useState<number[]>([]);
  const [spzCode, setSpzCodeState] = useState<string | null>(null);
  const [speciesCode, setSpeciesCodeState] = useState<string | null>(null);

  const setIdentifyActive = useCallback((active: boolean) => {
    setIdentifyActiveState(active);
  }, []);

  const toggleCatalogLayer = useCallback((id: string) => {
    setActiveCatalogLayers((prev) => (
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    ));
  }, []);

  const addAoi = useCallback((aoi: AoiPolygon) => {
    setAoisState((prev) => [...prev, aoi]);
  }, []);

  const removeLastAoi = useCallback(() => {
    setAoisState((prev) => (prev.length === 0 ? prev : prev.slice(0, -1)));
  }, []);

  const clearAois = useCallback(() => {
    setAoisState([]);
  }, []);

  const replaceAoi = useCallback((index: number, aoi: AoiPolygon) => {
    setAoisState((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const next = prev.slice();
      next[index] = aoi;
      return next;
    });
  }, []);

  const setAois = useCallback((next: AoiPolygon[]) => {
    setAoisState(next);
  }, []);

  const setBecZones = useCallback(
    (codes: string[], notSuit: string[], shape: 'zone' | 'mapLabel' = 'zone') => {
      setBecZoneCodes(codes);
      setBecNotSuit(notSuit);
      setBecZoneShape(shape);
    },
    []
  );

  const setExtentBounds = useCallback(
    (bounds: LatLngBoundsExpression | null) => {
      setExtentBoundsState(bounds);
    },
    []
  );

  // Seedlot wins when both are supplied — matches the legacy precedence
  // where the seedlot-point layer was painted on top of the veglot layer.
  // Enforced at the setter boundary so callers can pass both URL params
  // without having to dedupe themselves.
  const setHighlightPoint = useCallback(
    (seedlot: string | null, veglot: string | null) => {
      if (seedlot) {
        setSeedlotNumberState(seedlot);
        setVeglotNumberState(null);
      } else {
        setSeedlotNumberState(null);
        setVeglotNumberState(veglot);
      }
    },
    []
  );

  const setSpzIds = useCallback((ids: number[]) => {
    setSpzIdsState(ids);
  }, []);

  const setSpzCode = useCallback((code: string | null) => {
    setSpzCodeState(code);
  }, []);

  const setSpeciesCode = useCallback((code: string | null) => {
    setSpeciesCodeState(code);
  }, []);

  // Merge partial control maps so AoiDrawLayer and MeasureControl can
  // each register their own callbacks without overwriting the other's
  // entries. This is the intended pattern for the bridge — see the
  // MapControls type doc above.
  // eslint-disable-next-line no-underscore-dangle -- internal bridge setter, not public API
  const _setMapControls = useCallback((partial: Partial<MapControls>) => {
    setMapControlsState((prev) => ({ ...prev, ...partial }));
  }, []);

  const contextValue = useMemo<SparMapContextValue>(() => ({
    aois,
    addAoi,
    removeLastAoi,
    clearAois,
    replaceAoi,
    setAois,
    becZoneCodes,
    becNotSuit,
    becZoneShape,
    setBecZones,
    extentBounds,
    setExtentBounds,
    seedlotNumber,
    veglotNumber,
    setHighlightPoint,
    spzIds,
    setSpzIds,
    spzCode,
    setSpzCode,
    speciesCode,
    setSpeciesCode,
    startDraw: mapControls.startDraw,
    startEdit: mapControls.startEdit,
    startRemovalMode: mapControls.startRemovalMode,
    clearMapLayers: mapControls.clearMapLayers,
    cancelAoiMode: mapControls.cancelAoiMode,
    addImportedLayersToMap: mapControls.addImportedLayersToMap,
    startMeasure: mapControls.startMeasure,
    clearMeasure: mapControls.clearMeasure,
    startDrawPoint: mapControls.startDrawPoint,
    clearMarkupPoints: mapControls.clearMarkupPoints,
    cancelDrawPoint: mapControls.cancelDrawPoint,
    removeLastMapLayer: mapControls.removeLastMapLayer,
    flyToLocation: mapControls.flyToLocation,
    getCurrentView: mapControls.getCurrentView,
    restoreView: mapControls.restoreView,
    zoomToBC: mapControls.zoomToBC,
    zoomToInitialExtent: mapControls.zoomToInitialExtent,
    startDrawRectangle: mapControls.startDrawRectangle,
    startDrawCircle: mapControls.startDrawCircle,
    startDrawLine: mapControls.startDrawLine,
    zoomToAois: mapControls.zoomToAois,
    zoomToBecZone: mapControls.zoomToBecZone,
    goBackView: mapControls.goBackView,
    goForwardView: mapControls.goForwardView,
    canGoBack: viewHistoryAvail.canGoBack,
    canGoForward: viewHistoryAvail.canGoForward,
    _setViewHistoryAvailability,
    identifyActive,
    setIdentifyActive,
    activeCatalogLayers,
    toggleCatalogLayer,
    legendData,
    setLegendData,
    graticuleVisible,
    setGraticuleVisible,
    liveAoiValidation,
    setLiveAoiValidation,
    measurementMode,
    setMeasurementMode,
    measurementResult,
    setMeasurementResult,
    _setMapControls
  }), [
    aois, becZoneCodes, becNotSuit, becZoneShape, extentBounds, seedlotNumber,
    veglotNumber, spzIds, spzCode, speciesCode, mapControls, viewHistoryAvail,
    identifyActive, activeCatalogLayers, legendData, graticuleVisible, liveAoiValidation,
    measurementMode, measurementResult, addAoi, removeLastAoi, clearAois,
    replaceAoi, setAois, setBecZones, setExtentBounds, setHighlightPoint,
    setSpzIds, setSpzCode, setSpeciesCode, setIdentifyActive, toggleCatalogLayer,
    setGraticuleVisible, setLiveAoiValidation, setMeasurementMode,
    setMeasurementResult, _setViewHistoryAvailability, _setMapControls
  ]);

  return (
    <SparMapContext.Provider value={contextValue}>
      {children}
    </SparMapContext.Provider>
  );
};

/**
 * Hook to access the SPAR map context. Must be used inside `<SparMapProvider>`
 * (wrapping the `<SeedlotMap>` view) or it will throw.
 */
export const useSparMap = (): SparMapContextValue => {
  const ctx = useContext(SparMapContext);
  if (!ctx) {
    throw new Error('useSparMap must be used inside SparMapProvider');
  }
  return ctx;
};
