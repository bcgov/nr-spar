import React, { useEffect, useState, type FormEvent } from 'react';
import {
  Information,
  Ruler,
  Pin,
  Search,
  Bookmark,
  Printer,
  ZoomReset,
  CenterToFit
} from '@carbon/icons-react';

import { useSparMap } from '../../../../contexts/SparMapContext';
import { printMap } from '../printMap';

const parseCoordinate = (value: string) => {
  const numeric = Number(value.trim());
  return Number.isFinite(numeric) ? numeric : null;
};

const normalizeLongitude = (lng: number) => {
  // SPAR is a BC app; users often enter west longitude as a positive
  // degree value. Treat 114-140 as BC west-longitude shorthand.
  if (lng >= 114 && lng <= 140) return -lng;
  return lng;
};

export interface MapToolbarProps {
  /**
   * Seedlot number used in the print header. Can be empty when the URL
   * path param is missing — print still works, just with a blank slot.
   */
  seedlotNumber: string;
  /** Active theme — `printMap` looks up the visible overlays for the legend. */
  theme: import('../../../../types/SparMapTypes').SparMapTheme;
  /**
   * Whether the geocoder search card is currently visible. Drives the
   * Search button's active state. Lifted to the parent so the toolbar
   * and the SearchControl overlay can share visibility state.
   */
  searchVisible: boolean;
  /** Toggle the geocoder search card visibility. */
  onToggleSearch: () => void;
  /**
   * Whether the Bookmarks CollapsibleCard is currently expanded. Drives
   * the Bookmarks button's active state and the controlled-mode prop on
   * the existing Bookmarks card.
   */
  bookmarksOpen: boolean;
  /** Toggle the Bookmarks card open state. */
  onToggleBookmarks: () => void;
  /** Whether the Measurement Tools side panel is currently open. */
  measureToolsOpen: boolean;
  /** Toggle the Measurement Tools panel open state. */
  onToggleMeasureTools: () => void;
}

/**
 * Vertical iconic toolbar pinned to the top-left of the map workspace.
 * Mirrors the legacy SPAR cwmSparmap.jsp top-left tool strip (Identify /
 * Measure / Search / Bookmarks / Print) so operators have a consistent
 * affordance for the most-used tools regardless of theme.
 *
 * Rendered OUTSIDE `<MapContainer>` (it's UI chrome, not a Leaflet
 * plugin). Reaches into the Leaflet DOM directly via
 * `document.querySelector('.leaflet-container')` to toggle the
 * `identify-active` class — `<BecIdentifyLayer>` does the same thing on
 * its own when mounted, but on COLAREA there is no `BecIdentifyLayer`,
 * so the toolbar handles the class toggle itself for theme-agnostic
 * cursor feedback.
 *
 * Search and Bookmarks visibility is lifted to the parent
 * (`SeedlotMap/index.tsx`) so the toolbar buttons and the existing
 * SearchControl + BookmarksPanel overlays share state without
 * prop-drilling through unrelated layers.
 *
 * Styled to match Leaflet's default control bar (`.leaflet-bar`-style):
 * white background, dark border, square 30px buttons. See
 * `../styles.scss` for the `.map-toolbar` selectors.
 */
const MapToolbar = ({
  seedlotNumber,
  theme,
  searchVisible,
  onToggleSearch,
  bookmarksOpen,
  onToggleBookmarks,
  measureToolsOpen,
  onToggleMeasureTools
}: MapToolbarProps) => {
  const {
    identifyActive,
    setIdentifyActive,
    setMeasurementMode,
    startDrawPoint,
    cancelDrawPoint,
    cancelAoiMode,
    zoomToBC,
    zoomToInitialExtent,
    legendData
  } = useSparMap();
  const [pinPanelOpen, setPinPanelOpen] = useState(false);
  const [pinLat, setPinLat] = useState('');
  const [pinLng, setPinLng] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Toggle the `identify-active` class on the Leaflet container so the
  // cursor changes to `help` regardless of theme. `<BecIdentifyLayer>`
  // does the same dance when mounted (AOUCBST/PLANTSITECBST), so the
  // toggle is idempotent and safe on those themes too.
  useEffect(() => {
    const container = document.querySelector('.leaflet-container');
    if (!container) return undefined;
    if (identifyActive) {
      container.classList.add('identify-active');
    } else {
      container.classList.remove('identify-active');
    }
    return () => {
      container.classList.remove('identify-active');
    };
  }, [identifyActive]);

  const onIdentifyClick = () => {
    cancelDrawPoint?.();
    cancelAoiMode?.();
    // Cancel any active measurement so only one tool runs at a time.
    setMeasurementMode?.(null);
    setIdentifyActive(!identifyActive);
  };

  // Ruler button — opens / closes the Measurement Tools side panel.
  // The panel's own buttons drive the active mode; clicking the
  // toolbar icon is just the entry point, not an immediate action.
  const onMeasureClick = () => {
    cancelDrawPoint?.();
    cancelAoiMode?.();
    if (identifyActive) setIdentifyActive(false);
    onToggleMeasureTools();
  };

  const onDrawPointClick = () => {
    setMeasurementMode?.(null);
    cancelAoiMode?.();
    cancelDrawPoint?.();
    if (identifyActive) setIdentifyActive(false);
    setPinError(null);
    setPinPanelOpen((open) => !open);
  };

  const onClickMapForPoint = () => {
    startDrawPoint?.();
    setPinPanelOpen(false);
  };

  const onDropCoordinatePoint = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const lat = parseCoordinate(pinLat);
    const lng = parseCoordinate(pinLng);

    if (lat === null || lng === null) {
      setPinError('Enter numeric latitude and longitude.');
      return;
    }

    const normalizedLng = normalizeLongitude(lng);
    if (lat < -90 || lat > 90 || normalizedLng < -180 || normalizedLng > 180) {
      setPinError('Latitude must be -90 to 90 and longitude must be -180 to 180.');
      return;
    }

    startDrawPoint?.({ lat, lng: normalizedLng });
    setPinLng(String(normalizedLng));
    setPinError(null);
    setPinPanelOpen(false);
  };

  const onSearchClick = () => {
    onToggleSearch();
  };

  const onBookmarksClick = () => {
    onToggleBookmarks();
  };

  const onPrintClick = () => {
    printMap({ seedlotNumber, theme, legendData });
  };

  // The Measure button now always opens the Measurement Tools panel —
  // no dependency on a bridge callback. The panel itself drives mode.
  const measureDisabled = false;
  const drawPointDisabled = !startDrawPoint;

  return (
    <div className="map-toolbar-shell">
      <div
        className="map-toolbar leaflet-bar"
        role="toolbar"
        aria-label="Map tools"
        data-testid="map-toolbar"
      >
        <button
          type="button"
          className={
            `map-toolbar__btn${identifyActive ? ' map-toolbar__btn--active' : ''}`
          }
          title={
            identifyActive
              ? 'Identify mode ON — click a feature on the map'
              : 'Identify'
          }
          aria-label="Identify"
          aria-pressed={identifyActive}
          onClick={onIdentifyClick}
          data-testid="toolbar-identify"
        >
          <Information size={18} />
        </button>
        <button
          type="button"
          className={
            `map-toolbar__btn${measureToolsOpen ? ' map-toolbar__btn--active' : ''}`
          }
          title="Measurement Tools"
          aria-label="Measurement Tools"
          aria-pressed={measureToolsOpen}
          onClick={onMeasureClick}
          disabled={measureDisabled}
          data-testid="toolbar-measure"
        >
          <Ruler size={18} />
        </button>
        <button
          type="button"
          className={
            `map-toolbar__btn${pinPanelOpen ? ' map-toolbar__btn--active' : ''}`
          }
          title={drawPointDisabled ? 'Draw Point (loading…)' : 'Draw Point'}
          aria-label="Draw Point"
          aria-pressed={pinPanelOpen}
          onClick={onDrawPointClick}
          disabled={drawPointDisabled}
          data-testid="toolbar-draw-point"
        >
          <Pin size={18} />
        </button>
        <button
          type="button"
          className={
            `map-toolbar__btn${searchVisible ? ' map-toolbar__btn--active' : ''}`
          }
          title="Search"
          aria-label="Search"
          aria-pressed={searchVisible}
          onClick={onSearchClick}
          data-testid="toolbar-search"
        >
          <Search size={18} />
        </button>
        <button
          type="button"
          className={
            `map-toolbar__btn${bookmarksOpen ? ' map-toolbar__btn--active' : ''}`
          }
          title="Bookmarks"
          aria-label="Bookmarks"
          aria-pressed={bookmarksOpen}
          onClick={onBookmarksClick}
          data-testid="toolbar-bookmarks"
        >
          <Bookmark size={18} />
        </button>
        <button
          type="button"
          className="map-toolbar__btn"
          title="Print"
          aria-label="Print"
          onClick={onPrintClick}
          data-testid="toolbar-print"
        >
          <Printer size={18} />
        </button>
        <button
          type="button"
          className="map-toolbar__btn"
          title="Zoom to British Columbia"
          aria-label="Zoom to British Columbia"
          onClick={() => zoomToBC?.()}
          disabled={!zoomToBC}
          data-testid="toolbar-zoom-bc"
        >
          <ZoomReset size={18} />
        </button>
        <button
          type="button"
          className="map-toolbar__btn"
          title="Zoom to initial extent"
          aria-label="Zoom to initial extent"
          onClick={() => zoomToInitialExtent?.()}
          disabled={!zoomToInitialExtent}
          data-testid="toolbar-zoom-extent"
        >
          <CenterToFit size={18} />
        </button>
      </div>
      {pinPanelOpen && (
        <form
          className="coordinate-pin-panel"
          aria-label="Drop point at coordinates"
          data-testid="coordinate-pin-panel"
          onSubmit={onDropCoordinatePoint}
        >
          <label className="coordinate-pin-panel__field">
            <span>Latitude</span>
            <input
              type="text"
              inputMode="decimal"
              value={pinLat}
              onChange={(event) => setPinLat(event.target.value)}
              placeholder="49.2827"
              data-testid="coordinate-pin-lat"
            />
          </label>
          <label className="coordinate-pin-panel__field">
            <span>Longitude</span>
            <input
              type="text"
              inputMode="decimal"
              value={pinLng}
              onChange={(event) => setPinLng(event.target.value)}
              placeholder="-123.1207"
              data-testid="coordinate-pin-lng"
            />
          </label>
          {pinError && (
            <div className="coordinate-pin-panel__error" role="alert">
              {pinError}
            </div>
          )}
          <div className="coordinate-pin-panel__actions">
            <button type="submit">Drop pin</button>
            <button type="button" onClick={onClickMapForPoint}>
              Click map
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default MapToolbar;
