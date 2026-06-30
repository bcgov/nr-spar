import React, { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { List, Close } from '@carbon/icons-react';

import { SPAR_MAP_THEMES } from '../../../types/SparMapTypes';
import type { SparMapTheme } from '../../../types/SparMapTypes';
import { getThemeProfile } from '../../../config/leaflet-themes';
import { SparMapProvider, useSparMap } from '../../../contexts/SparMapContext';
import {
  parseBecZoneParam,
  parseBecZoneCamelCaseParam,
  parseExtentParam
} from '../../../legacy_translated/SPR_SPATIAL_UTILS';

import LeafletMap from './LeafletMap';
import AoiToolbar from './AoiToolbar';
import MapToolbar from './MapToolbar';
import BecZonePanel from './BecZonePanel';
import GeomCalcPanel from './GeomCalcPanel';
import LegendPanel from './LegendPanel';
import MeasurementToolsPanel from './MeasurementToolsPanel';
import SearchControl from './SearchControl';
import BookmarksPanel from './BookmarksPanel';
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
export const SeedlotMapBody = () => {
  const { seedlotNumber } = useParams<{ seedlotNumber: string }>();
  const [searchParams] = useSearchParams();
  const {
    setBecZones,
    setExtentBounds,
    setHighlightPoint,
    setSpzIds,
    setSpzCode,
    setSpeciesCode
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
  const showAoiToolbar = profile.drawingEnabled;
  const showBecZonePanel = profile.showBecPanel;

  // ── Lifted UI state for the new top-left MapToolbar ──────────────
  // The toolbar's Search button toggles the geocoder card; default is
  // visible (legacy SPAR's geocoder was always shown). The Bookmarks
  // button toggles the existing CollapsibleCard via its controlled-mode
  // props so we don't duplicate the bookmarks UI.
  const [searchVisible, setSearchVisible] = useState(true);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  // Legacy CWM ships a "Map Legend" tool as a bulleted-list icon in the
  // top-right control strip, next to the layers icon. The button
  // toggles a side panel listing the WMS legend graphics for the
  // active overlays. Replaces the bottom-right floating Legend card.
  const [legendOpen, setLegendOpen] = useState(false);
  // Legacy CWM "Measurement Tools" panel — distance / area / point
  // modes with live readouts. The toolbar's ruler button toggles this
  // panel; the panel writes `measurementMode` into context which
  // `<MeasureControl>` watches.
  const [measureToolsOpen, setMeasureToolsOpen] = useState(false);

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
      setBecZonesRef.current([code], [], 'mapLabel');
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
    setHighlightPointRef.current(seedlotQ, veglotQ);
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
    setSpzCodeRef.current(searchParams.get('spz'));
  }, [searchParams]);
  useEffect(() => {
    setSpeciesCodeRef.current(searchParams.get('species'));
  }, [searchParams]);

  return (
    <div className="seedlot-map-page" data-testid="seedlot-map-page">
      {/* Print-only header — hidden on screen, visible when window.print() fires. */}
      <div className="print-header" data-testid="print-header">
        <span className="print-header__wordmark">Government of British Columbia</span>
        <span className="print-header__seedlot">
          Seedlot
          {seedlotNumber}
        </span>
        <span className="print-header__date">{new Date().toLocaleDateString()}</span>
      </div>

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

        {/*
          SEARCH (geocoder) — Batch 3. Free-text location search via the
          BC Gov geocoder. Visibility is now toggleable via the
          map toolbar's Search button so operators can reclaim screen
          real estate when they're not searching. Defaults to visible
          to preserve legacy SPAR's always-shown geocoder behaviour.
        */}
        {searchVisible && (
          <div className="map-overlay map-overlay--top-center">
            <SearchControl />
          </div>
        )}

        {/*
          Top-left tool stack. Drawing-enabled themes get a single unified
          AOI toolbar so Draw Point / Search / Bookmarks / Print live with
          the polygon tools instead of duplicating a second control strip.
        */}
        <div className="map-overlay map-overlay--top-left-tools">
          {/*
            Bookmarks + Measurement Tools both anchor to the LEFT next
            to the toolbar; opening one closes the other so the two
            popovers never stack on top of each other.
          */}
          {showAoiToolbar ? (
            <AoiToolbar
              seedlotNumber={seedlotNumber ?? ''}
              theme={theme}
              searchVisible={searchVisible}
              onToggleSearch={() => setSearchVisible((v) => !v)}
              bookmarksOpen={bookmarksOpen}
              onToggleBookmarks={() => {
                setBookmarksOpen((v) => !v);
                setMeasureToolsOpen(false);
              }}
              measureToolsOpen={measureToolsOpen}
              onToggleMeasureTools={() => {
                setMeasureToolsOpen((v) => !v);
                setBookmarksOpen(false);
              }}
            />
          ) : (
            <MapToolbar
              seedlotNumber={seedlotNumber ?? ''}
              theme={theme}
              searchVisible={searchVisible}
              onToggleSearch={() => setSearchVisible((v) => !v)}
              bookmarksOpen={bookmarksOpen}
              onToggleBookmarks={() => {
                setBookmarksOpen((v) => !v);
                setMeasureToolsOpen(false);
              }}
              measureToolsOpen={measureToolsOpen}
              onToggleMeasureTools={() => {
                setMeasureToolsOpen((v) => !v);
                setBookmarksOpen(false);
              }}
            />
          )}
        </div>

        {/*
          GEOMCALC card — kept as the only bottom-right card for now,
          pending product-owner direction on whether to keep it as a
          floating panel, fold it into the AOI side panel, or remove
          it. Drawing-enabled themes only. Per-polygon area, perimeter,
          vertex count + longest-edge bearing + elevation min/max.
        */}
        {showAoiToolbar && (
          <div className="map-overlay map-overlay--top-right-stack">
            <CollapsibleCard title="Polygon statistics" defaultOpen={false}>
              <GeomCalcPanel />
            </CollapsibleCard>
          </div>
        )}

        {/*
          Legend icon — top-right, sits next to the layers icon in the
          tree LayersControl. Matches the legacy CWM "Map Legend" tool
          (bulleted-list icon in the top-right horizontal toolbar of
          cwmSparmap.jsp). The button is `.leaflet-bar`-styled so it
          visually reads as a sibling of the layers control.
        */}
        <button
          type="button"
          className={`map-icon-button map-icon-button--legend${legendOpen ? ' is-active' : ''}`}
          aria-label="Map legend"
          aria-pressed={legendOpen}
          title="Map Legend"
          onClick={() => setLegendOpen((v) => !v)}
        >
          <List size={20} aria-hidden="true" />
        </button>

        {/*
          Legend side panel — slides in from the right when the Legend
          icon is toggled on. Renders the same `LegendPanel` that used
          to live in the bottom-right CollapsibleCard, just attached
          to its trigger so it doesn't float in the corner.
        */}
        {legendOpen && (
          <div
            className="map-overlay map-overlay--side-panel-right"
            role="region"
            aria-label="Map legend"
          >
            <div className="map-overlay__header">
              <span>Legend</span>
              <button
                type="button"
                className="map-overlay__close"
                aria-label="Close legend"
                onClick={() => setLegendOpen(false)}
              >
                <Close size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="map-overlay__body">
              <LegendPanel />
            </div>
          </div>
        )}

        {/*
          Bookmarks side panel — slides in from the LEFT of the map,
          anchored next to the top-left MapToolbar where the legacy
          CWM Bookmarks tool lived (last button in the top-left
          vertical strip). The toolbar's Bookmark button toggles
          `bookmarksOpen`; the panel reads the same state.
        */}
        {bookmarksOpen && (
          <div
            className="map-overlay map-overlay--side-panel-left"
            role="region"
            aria-label="Map bookmarks"
          >
            <div className="map-overlay__header">
              <span>Bookmarks</span>
              <button
                type="button"
                className="map-overlay__close"
                aria-label="Close bookmarks"
                onClick={() => setBookmarksOpen(false)}
              >
                <Close size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="map-overlay__body">
              <BookmarksPanel />
            </div>
          </div>
        )}

        {/*
          Measurement Tools side panel — mirrors the legacy CWM
          `Measurement` panel: Distance / Area / Point modes + Clear
          + live readouts. Toolbar's Ruler button toggles the panel;
          the panel writes the mode to context, MeasureControl reacts.
        */}
        {measureToolsOpen && (
          <div
            className="map-overlay map-overlay--side-panel-left map-overlay--side-panel-left-2"
            role="region"
            aria-label="Measurement tools"
          >
            <div className="map-overlay__header">
              <span>Measurement Tools</span>
              <button
                type="button"
                className="map-overlay__close"
                aria-label="Close measurement tools"
                onClick={() => setMeasureToolsOpen(false)}
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
