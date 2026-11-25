import React, { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Close } from '@carbon/icons-react';

import { SPAR_MAP_THEMES } from '../../../types/SparMapTypes';
import type { SparMapTheme } from '../../../types/SparMapTypes';
import { getThemeProfile } from '../../../config/leaflet-themes';
import { SparMapProvider, useSparMap } from '../../../contexts/SparMapContext';
import {
  parseBecZoneParam,
  parseBecZoneCamelCaseParam,
  parseExtentParam
} from '../../../legacy_translated/SPR_SPATIAL_UTILS';
import { isCqlSafeIdentifier } from '../../../utils/CqlUtils';

import LeafletMap from './LeafletMap';
import AoiToolbar from './AoiToolbar';
import MapTopBar from './MapTopBar';
import LayersPanel from './LayersPanel';
import { MapLayersProvider } from './MapLayers/MapLayersContext';
import BecZonePanel from './BecZonePanel';
import GeomCalcPanel from './GeomCalcPanel';
import LegendPanel from './LegendPanel';
import MeasurementToolsPanel from './MeasurementToolsPanel';
import SearchControl from './SearchControl';
import CollapsibleCard from './CollapsibleCard';

import './styles.scss';

// Default fallback when the URL has no `theme=` param (or has an unknown
// one). Legacy `cwmSparmap.jsp:138` set `Sparmap.theme = "default"` for
// empty/blank query strings — the new code matches that read-only
// fallback. Operators must opt into COLAREA explicitly via the URL.
const DEFAULT_THEME: SparMapTheme = 'default';

// Themes that opt into AOI drawing + save affordances. Kept as a literal
// Removed: hardcoded DRAWING_THEMES and BEC_PANEL_THEMES arrays (§9.9).
// These flags are now read from each theme's profile object via
// getThemeProfile(theme).drawingEnabled and .showBecPanel — single
// source of truth in the profile configs, no duplication here.

/**
 * Inner component — runs inside the SparMapProvider tree so it can call
 * useSparMap. Reads URL params and pushes parsed state into the context.
 *
 * The outer `<SeedlotMap>` component wraps this in `<SparMapProvider>`,
 * so the Body/Provider split is required — `useSparMap()` can only be
 * called from a descendant of the provider.
 */
type RightPanel = 'layers' | 'legend' | 'measure' | null;

export const SeedlotMapBody = () => {
  const { seedlotNumber } = useParams<{ seedlotNumber: string }>();
  const [searchParams] = useSearchParams();
  const {
    setBecZones,
    setExtentBounds,
    setHighlightPoint,
    setSpzIds,
    setSpzCode,
    setSpeciesCode,
    setIdentifyActive,
    cancelAoiMode
  } = useSparMap();

  // Keep the latest setters in refs so the URL-param useEffect below
  // depends only on `searchParams`. The `SparMapContext` setters are
  // re-created on every provider render, which would otherwise make the
  // effect re-run in a loop and lock up the renderer. We learned this
  // the hard way on Task 16 with `setBecZones`; same pattern applies to
  // every new setter we add here.
  const setBecZonesRef = useRef(setBecZones);
  setBecZonesRef.current = setBecZones;
  const setExtentBoundsRef = useRef(setExtentBounds);
  setExtentBoundsRef.current = setExtentBounds;
  const setHighlightPointRef = useRef(setHighlightPoint);
  setHighlightPointRef.current = setHighlightPoint;
  const setSpzIdsRef = useRef(setSpzIds);
  setSpzIdsRef.current = setSpzIds;
  const setSpzCodeRef = useRef(setSpzCode);
  setSpzCodeRef.current = setSpzCode;
  const setSpeciesCodeRef = useRef(setSpeciesCode);
  setSpeciesCodeRef.current = setSpeciesCode;

  const themeParam = searchParams.get('theme');
  const theme: SparMapTheme = (SPAR_MAP_THEMES as readonly string[])
    .includes(themeParam ?? '')
    ? (themeParam as SparMapTheme)
    : DEFAULT_THEME;

  const profile = getThemeProfile(theme);

  // Read UI flags from the theme profile — single source of truth.
  const { drawingEnabled } = profile;
  const showBecZonePanel = profile.showBecPanel;

  // ── Right-hand side panel, opened from the top-right bar ─────────
  // Layers, the legend (legacy CWM "Map Legend"), and the legacy CWM
  // "Measurement Tools" panel share one slot below the bar, so only one
  // is open at a time. The measurement panel writes `measurementMode`
  // into context; `<MeasureControl>` watches it.
  const [rightPanel, setRightPanel] = useState<RightPanel>(null);
  const toggleRightPanel = (panel: Exclude<RightPanel, null>) => {
    setRightPanel((current) => (current === panel ? null : panel));
  };
  const closeRightPanel = () => setRightPanel(null);
  const onToggleMeasure = () => {
    // One tool at a time: measuring stops Identify and any drawing.
    if (rightPanel !== 'measure') {
      setIdentifyActive(false);
      cancelAoiMode?.();
    }
    toggleRightPanel('measure');
  };

  // Parse both URL param families and feed them into the BEC zone context.
  // Lowercase `beczone=IDF,MH_,SBS` wins if both are present (legacy
  // convention from CbstAltAction / SuitableSeedlotVeglotCbstAction). The
  // camelCase `becZone=IDFmw1` is a single concatenated value treated as
  // one code in the panel.
  useEffect(() => {
    const becZoneLower = searchParams.get('beczone');
    const becZoneCamel = searchParams.get('becZone');
    if (becZoneLower) {
      const { codes, notSuit } = parseBecZoneParam(becZoneLower);
      setBecZonesRef.current(codes, notSuit, 'zone');
    } else if (becZoneCamel) {
      const { code } = parseBecZoneCamelCaseParam(becZoneCamel);
      setBecZonesRef.current(code ? [code] : [], [], 'mapLabel');
    } else {
      setBecZonesRef.current([], [], 'zone');
    }
  }, [searchParams]);

  // Parse `extent=minX,minY,maxX,maxY` (BC Albers) and reproject into a
  // Leaflet-friendly LatLngBoundsExpression. Bad params (wrong arity,
  // non-numeric, proj4 throwing) clear the override so the map falls
  // back to the theme profile's `defaultExtent` rather than crashing.
  useEffect(() => {
    const extentParam = searchParams.get('extent');
    if (!extentParam) {
      setExtentBoundsRef.current(null);
      return;
    }
    try {
      const parts = extentParam.split(',').map(Number);
      if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
        setExtentBoundsRef.current(null);
        return;
      }
      setExtentBoundsRef.current(parseExtentParam(extentParam));
    } catch {
      // proj4 will throw on malformed inputs; degrade gracefully.
      setExtentBoundsRef.current(null);
    }
  }, [searchParams]);

  // Parse the seedlot/veglot point highlight params. `setHighlightPoint`
  // enforces mutual exclusivity (seedlot wins). The path-param seedlot
  // (which drives the page title) is intentionally separate from the
  // highlight `seedlot=` query param — legacy code allowed showing a
  // different seedlot's point while viewing another's page.
  useEffect(() => {
    const seedlotQ = searchParams.get('seedlot');
    const veglotQ = searchParams.get('veglot');
    setHighlightPointRef.current(
      seedlotQ && isCqlSafeIdentifier(seedlotQ) ? seedlotQ : null,
      veglotQ && isCqlSafeIdentifier(veglotQ) ? veglotQ : null
    );
  }, [searchParams]);

  // Parse `spzid=1284,1342` CSV — drop blanks/non-integers rather than
  // failing the whole render when one entry is malformed. Legacy SPAR
  // was permissive here (it would silently skip bad IDs).
  useEffect(() => {
    const spzidParam = searchParams.get('spzid');
    if (!spzidParam) {
      setSpzIdsRef.current([]);
      return;
    }
    const parsed = spzidParam
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => Number.parseInt(s, 10))
      .filter((n) => Number.isInteger(n));
    setSpzIdsRef.current(parsed);
  }, [searchParams]);

  // Parity-only fields — legacy `spz=` (string code like "M") and
  // `species=` (e.g. "FDC") are stashed in context but no overlay reads
  // them yet. Leaving the wiring here so future work can pick them up
  // without re-touching the URL parser.
  useEffect(() => {
    const spz = searchParams.get('spz');
    setSpzCodeRef.current(spz && isCqlSafeIdentifier(spz) ? spz : null);
  }, [searchParams]);
  useEffect(() => {
    const species = searchParams.get('species');
    setSpeciesCodeRef.current(species && isCqlSafeIdentifier(species) ? species : null);
  }, [searchParams]);

  return (
    <MapLayersProvider>
      <div className="seedlot-map-page" data-testid="seedlot-map-page">
        <div className="seedlot-map-header">
          <h1 className="seedlot-map-title">
            Seed Map
            {' — '}
            {seedlotNumber}
          </h1>
        </div>

        <div className="seedlot-map-workspace">
          {/* The Leaflet map fills the workspace — overlay cards float on top. */}
          <LeafletMap theme={theme} />

          {/* SEARCH (geocoder) — free-text location search via the BC Gov
              geocoder, always shown (legacy SPAR's geocoder was too). */}
          <div className="map-overlay map-overlay--top-center">
            <SearchControl />
          </div>

          {/* Top-left tool strip — one toolbar for every theme, below the
              zoom control. Drawing themes also get the polygon tools box
              and the Close button. */}
          <div className="map-overlay map-overlay--top-left-tools">
            <AoiToolbar
              seedlotNumber={seedlotNumber ?? ''}
              drawingEnabled={drawingEnabled}
              measureOpen={rightPanel === 'measure'}
              onToggleMeasure={onToggleMeasure}
            />
          </div>

          {/*
          GEOMCALC card — kept as the only bottom-right card for now,
          pending product-owner direction on whether to keep it as a
          floating panel, fold it into the AOI side panel, or remove
          it. Drawing-enabled themes only. Per-polygon area, perimeter,
          vertex count + longest-edge bearing + elevation min/max.
        */}
          {drawingEnabled && (
          <div className="map-overlay map-overlay--top-right-stack">
            <CollapsibleCard title="Polygon statistics" defaultOpen={false}>
              <GeomCalcPanel />
            </CollapsibleCard>
          </div>
        )}

          {/*
            Top-right map bar — Help / Print / Fullscreen / Legend icons and
            the labelled Layers button. Legend, Layers, and the toolbar's
            Measure button open side panels in the same right-hand slot.
          */}
          <MapTopBar
            seedlotNumber={seedlotNumber ?? ''}
            theme={theme}
            legendOpen={rightPanel === 'legend'}
            onToggleLegend={() => toggleRightPanel('legend')}
            layersOpen={rightPanel === 'layers'}
            onToggleLayers={() => toggleRightPanel('layers')}
          />

          {rightPanel === 'layers' && <LayersPanel theme={theme} onClose={closeRightPanel} />}

          {rightPanel === 'legend' && (
            <div
              className="map-overlay map-overlay--side-panel-right"
              aria-label="Map legend"
            >
              <div className="map-overlay__header">
                <span>Legend</span>
                <button
                  type="button"
                  className="map-overlay__close"
                  aria-label="Close legend"
                  onClick={closeRightPanel}
                >
                  <Close size={16} aria-hidden="true" />
                </button>
              </div>
              <div className="map-overlay__body">
                <LegendPanel />
              </div>
            </div>
          )}

          {rightPanel === 'measure' && (
            <div
              className="map-overlay map-overlay--side-panel-right"
              aria-label="Measurement tools"
            >
              <div className="map-overlay__header">
                <span>Measurement Tools</span>
                <button
                  type="button"
                  className="map-overlay__close"
                  aria-label="Close measurement tools"
                  onClick={closeRightPanel}
                >
                  <Close size={16} aria-hidden="true" />
                </button>
              </div>
              <div className="map-overlay__body">
                <MeasurementToolsPanel />
              </div>
            </div>
          )}

          {/*
          AOUCBST / PLANTSITECBST BEC zone side panel — anchored to the
          right side of the map, below the Layers/Legend icons. Restores
          the legacy `aoucbst_panel` (cwmSparmap.jsp:366-376) which was a
          300px vertical panel with clickable rows that highlighted and
          zoomed to a BEC zone on the map. The panel positions itself
          via `.bec-zone-panel--side` (absolute) so it floats over the
          workspace without stealing layout space.
        */}
          {showBecZonePanel && <BecZonePanel />}
        </div>
      </div>
    </MapLayersProvider>
  );
};

/**
 * Top-level SPAR map view. Hosted at `/seedlots/map/:seedlotNumber`.
 *
 * Provides `<SparMapProvider>` and delegates rendering to `<SeedlotMapBody>`
 * so the body can call `useSparMap()` safely. Reads the seedlot number from
 * the URL path param and the (optional) `theme`, `beczone`, and `becZone`
 * query params.
 */
const SeedlotMap = () => (
  <SparMapProvider>
    <SeedlotMapBody />
  </SparMapProvider>
);

export default SeedlotMap;
