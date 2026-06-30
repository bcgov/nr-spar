import React, { useRef, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import area from '@turf/area';
import { IconButton, InlineNotification, ActionableNotification } from '@carbon/react';
import {
  Draw,
  Edit,
  Erase,
  Upload,
  TrashCan,
  Undo,
  CheckmarkFilled,
  Save,
  Ruler,
  Pin,
  Search,
  Bookmark,
  DocumentDownload,
  Information,
  Printer,
  Layers,
  ZoomReset,
  CenterToFit,
  Maximize,
  Grid,
  Crop,
  CircleDash,
  ConnectTarget,
  ZoomIn,
  ArrowLeft,
  ArrowRight,
  Help,
  Close
} from '@carbon/icons-react';

import { useSparMap } from '../../../../contexts/SparMapContext';
import { useAoiSave } from './useAoiSave';
import {
  validatePolygons,
  validateAoiPolygons,
  buildMultiPolygonFeature
} from './aoiValidation';
import { importShapeFile } from './importShape';
import { printMap } from '../printMap';

import ExportMenu from './ExportMenu';
import { LoadingMask } from './LoadingMask';
import LayerCatalogModal from '../LayerCatalogModal';
import HelpModal from '../HelpModal';

interface AoiToolbarProps {
  seedlotNumber: string;
  /**
   * Active map theme — needed by `printMap` to look up which overlays
   * are visible and worthy of a legend graphic on the printed page.
   */
  theme: import('../../../../types/SparMapTypes').SparMapTheme;
  searchVisible?: boolean;
  onToggleSearch?: () => void;
  bookmarksOpen?: boolean;
  onToggleBookmarks?: () => void;
  measureToolsOpen?: boolean;
  onToggleMeasureTools?: () => void;
}

interface InlineMessage {
  kind: 'success' | 'error' | 'info' | 'warning';
  title: string;
  subtitle?: string;
}

type ToolbarGroup = 'inspect' | 'aoi' | 'files' | 'measure' | 'view';

/**
 * localStorage key used to remember whether the user has dismissed the
 * one-time COLAREA welcome panel. Mirrors the legacy SPAR welcome text
 * from `cwmSparmap.jsp`'s `aoi_panel` — shown once for first-time
 * operators, then persistently hidden.
 */
const WELCOME_DISMISSED_KEY = 'spar-map-welcome-dismissed';

/**
 * File extensions accepted by the Import Shape File picker. We also set
 * the corresponding MIME types so browsers that rely on `accept` for
 * mime-filtering (Firefox) surface KML and KMZ in the dialog.
 */
const ACCEPTED_IMPORT_EXTENSIONS = '.kml,.kmz,.zip,.shp,.geojson,.json,application/vnd.google-earth.kml+xml,application/vnd.google-earth.kmz,application/zip,application/geo+json,application/json';

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

const formatSaveError = (error: unknown) => {
  const maybeAxiosError = error as {
    code?: string;
    message?: string;
    response?: {
      status?: number;
    };
  };

  if (maybeAxiosError.response?.status === 404) {
    return 'AOI save endpoint or seedlot was not found. Check that the SPAR backend is running and this seedlot number exists.';
  }

  if (
    maybeAxiosError.response?.status === 401
    || maybeAxiosError.response?.status === 403
  ) {
    return 'AOI save was blocked by backend auth or CSRF. Restart the SPAR backend so the local map save bypass is loaded.';
  }

  if (
    maybeAxiosError.code === 'ERR_NETWORK'
    || maybeAxiosError.message?.toLowerCase().includes('network error')
  ) {
    return 'SPAR backend is not reachable at http://localhost:8090. Start the backend or check VITE_SERVER_URL.';
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return String(error);
};

/**
 * Carbon-styled toolbar for the AOI polygon flow. Mirrors the legacy
 * SPAR `aoi_panel` button set from `cwmSparmap.jsp` / `sparmap.js` —
 * Add Polygon, Edit Polygon, Import Shape File, Clear Last, Clear All,
 * Validate Polygon, and Submit. The legacy Cancel button was dropped in
 * the React rewrite because the browser back button fills the same role
 * and `SparMapProvider` is scoped to this route — unmount already
 * clears the in-memory AOI list and the Leaflet layers.
 *
 * Reads/writes the multi-polygon AOI list via `useSparMap` and drives
 * Geoman draw/edit/clear operations through the map control bridge
 * registered by `<AoiDrawLayer>`. The toolbar lives OUTSIDE the
 * `<MapContainer>`, so we can't call `useMap()` here directly — we lean
 * on context callbacks instead.
 *
 * Import Shape File (Phase 3) accepts KML, KMZ, and ESRI Shapefile
 * (.zip) via a hidden native file input; the parsed polygons are pushed
 * onto the live Leaflet map and synced into context via the
 * `addImportedLayersToMap` bridge callback.
 *
 * Save errors and validation results surface via Carbon
 * `InlineNotification` so the user can retry without losing drawn
 * polygons in context state.
 */
const AoiToolbar = ({
  seedlotNumber,
  theme,
  searchVisible = false,
  onToggleSearch,
  bookmarksOpen = false,
  onToggleBookmarks,
  measureToolsOpen = false,
  onToggleMeasureTools
}: AoiToolbarProps) => {
  const {
    aois,
    clearAois,
    startDraw,
    startEdit,
    startRemovalMode,
    clearMapLayers,
    cancelAoiMode,
    addImportedLayersToMap,
    removeLastMapLayer,
    setMeasurementMode,
    startDrawPoint,
    cancelDrawPoint,
    identifyActive,
    setIdentifyActive,
    zoomToBC,
    zoomToInitialExtent,
    graticuleVisible,
    setGraticuleVisible,
    startDrawRectangle,
    startDrawCircle,
    startDrawLine,
    zoomToAois,
    setBecZones,
    goBackView,
    goForwardView,
    canGoBack,
    canGoForward,
    liveAoiValidation
  } = useSparMap();
  const save = useAoiSave(seedlotNumber);
  const navigate = useNavigate();
  // POC: registration-form integration. When the map is launched from a form
  // with a `returnTo`, a successful Submit hands the collection-area summary
  // back to that form via router state instead of just showing a toast.
  const [searchParams] = useSearchParams();

  const [validation, setValidation] = useState<InlineMessage | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [importStatus, setImportStatus] = useState<InlineMessage | null>(null);
  const [welcomeDismissed, setWelcomeDismissed] = useState(() => {
    try {
      return window.localStorage.getItem(WELCOME_DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  });
  const dismissWelcome = () => {
    try {
      window.localStorage.setItem(WELCOME_DISMISSED_KEY, '1');
    } catch {
      // Private-browsing or quota-full — silently drop. The panel will
      // re-show next mount, which is acceptable failure mode.
    }
    setWelcomeDismissed(true);
  };
  const [pinPanelOpen, setPinPanelOpen] = useState(false);
  const [pinLat, setPinLat] = useState('');
  const [pinLng, setPinLng] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<ToolbarGroup | null>(null);
  // EXPORT modal (Batch 2) — opens a Carbon Modal with a RadioButton
  // group so the user can pick GeoJSON, KML, or Shapefile. Disabled
  // whenever the AOI list is empty; the modal itself guards against a
  // zero-AOI export in case state drifts between open + submit.
  const [exportOpen, setExportOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  // We render a hidden native file input rather than `FileUploaderButton`
  // so the import button can carry an icon and share the exact same
  // Carbon tertiary-button look as the rest of the toolbar.
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasAoi = aois.length > 0;

  // Exiting identify mode when the user switches to a drawing/edit/measure
  // tool keeps the mode mental model simple: only one tool active at a
  // time, and the Identify button visually reflects the truth.
  const exitIdentify = () => setIdentifyActive(false);
  const exitMeasureAndMarkup = () => {
    setMeasurementMode?.(null);
    cancelDrawPoint?.();
  };

  const onAddPolygon = () => {
    setValidation(null);
    // eslint-disable-next-line no-use-before-define -- callback defined below
    highlightBecZones([]);
    exitIdentify();
    exitMeasureAndMarkup();
    startDraw();
  };

  const onAddRectangle = () => {
    setValidation(null);
    // eslint-disable-next-line no-use-before-define -- callback defined below
    highlightBecZones([]);
    exitIdentify();
    exitMeasureAndMarkup();
    startDrawRectangle?.();
  };

  const onAddCircle = () => {
    setValidation(null);
    // eslint-disable-next-line no-use-before-define -- callback defined below
    highlightBecZones([]);
    exitIdentify();
    exitMeasureAndMarkup();
    startDrawCircle?.();
  };

  const onAddLine = () => {
    setValidation(null);
    // eslint-disable-next-line no-use-before-define -- callback defined below
    highlightBecZones([]);
    exitIdentify();
    exitMeasureAndMarkup();
    startDrawLine?.();
  };

  const onEditPolygon = () => {
    setValidation(null);
    exitIdentify();
    exitMeasureAndMarkup();
    startEdit();
  };

  // Delete a single polygon: enter Geoman removal mode, then the user
  // clicks the polygon they want gone. Distinct from Clear Last (pops the
  // most recent) and Clear All (wipes everything).
  const onDeletePolygon = () => {
    setValidation(null);
    exitIdentify();
    exitMeasureAndMarkup();
    startRemovalMode();
  };

  const onToggleIdentify = () => {
    setValidation(null);
    setPinPanelOpen(false);
    exitMeasureAndMarkup();
    cancelAoiMode?.();
    setIdentifyActive(!identifyActive);
  };

  const toggleGroup = (group: ToolbarGroup) => {
    const nextGroup = openGroup === group ? null : group;
    setOpenGroup(nextGroup);
    if (nextGroup !== 'inspect') {
      setPinPanelOpen(false);
      cancelDrawPoint?.();
    }
  };

  const groupButtonClass = (active: boolean) => (
    active ? 'aoi-toolbar__icon-btn--active' : ''
  );

  const onDrawPointClick = () => {
    setValidation(null);
    exitIdentify();
    setMeasurementMode?.(null);
    cancelAoiMode?.();
    cancelDrawPoint?.();
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

  const onClearLast = () => {
    setValidation(null);
    if (aois.length === 0) return;
    // Use the bridge callback registered by AoiDrawLayer — it calls
    // map.pm.getGeomanLayers() (proper Geoman API via the map instance),
    // removes the last layer, and rebuilds context state from the
    // remaining layers via setAois(rebuildFromMap()). No brittle
    // window.L.PM.Utils introspection needed.
    removeLastMapLayer?.();
  };

  const onClearAll = () => {
    setValidation(null);
    clearMapLayers();
    clearAois();
  };

  // When BEC-zone validation fails with >1 zone, push the offending
  // codes into context as "not-suit" so BecHighlightLayer paints them
  // in purple on the map. Operators can then see which zones their
  // polygon is straddling instead of having to guess from the error
  // text alone. Clears on a successful validation or new draw.
  const highlightBecZones = (zones: string[]) => {
    if (zones.length === 0) {
      setBecZones([], [], 'zone');
    } else {
      // Mark all as not-suit so they render in purple, which reads as
      // "these are the problem zones" without inventing a new style.
      setBecZones(zones, zones, 'zone');
    }
  };

  const onValidate = async () => {
    setIsValidating(true);
    setValidation({
      kind: 'info',
      title: 'Validating polygon',
      subtitle: 'Checking geometry and BEC Zone…'
    });
    try {
      const result = await validateAoiPolygons(aois);
      setValidation({
        kind: result.ok ? 'success' : 'error',
        title: result.ok ? 'Validation passed' : 'Validation failed',
        subtitle: result.message
      });
      // On multi-zone failure, light up the BEC zones on the map.
      // On pass (or topology-only failure), clear any previous highlights.
      if (!result.ok && result.becZones.length > 1) {
        highlightBecZones(result.becZones);
      } else {
        highlightBecZones([]);
      }
    } finally {
      setIsValidating(false);
    }
  };

  const onSubmit = async () => {
    setValidation(null);
    const feature = buildMultiPolygonFeature(aois);
    if (!feature) return;
    // Block submit when topology is invalid — matches the legacy
    // sparmap.js flow which forced Validate → Submit ordering.
    const topology = validatePolygons(aois);
    if (!topology.ok) {
      setValidation({
        kind: 'error',
        title: 'Cannot submit',
        subtitle: topology.message
      });
      return;
    }
    // Run the BEC-zone check up-front so we can highlight on failure
    // (the save mutation throws on multi-zone but loses the structured
    // zone list along the way).
    const becCheck = await validateAoiPolygons(aois);
    if (!becCheck.ok) {
      setValidation({
        kind: 'error',
        title: 'Cannot submit',
        subtitle: becCheck.message
      });
      if (becCheck.becZones.length > 1) {
        highlightBecZones(becCheck.becZones);
      }
      return;
    }
    highlightBecZones([]);

    // POC: when not launched from a form, keep the standalone behaviour
    // (fire-and-forget save + inline success toast).
    const returnTo = searchParams.get('returnTo');
    if (!returnTo) {
      save.mutate(feature);
      return;
    }

    // Launched from the registration form: await the save, then return the
    // collection-area summary to the form so it can display + reconcile it.
    try {
      await save.mutateAsync(feature);
    } catch (err) {
      setValidation({
        kind: 'error',
        title: 'Save failed',
        subtitle: err instanceof Error ? err.message : 'Could not save the collection area.'
      });
      return;
    }
    const areaHectares = Math.round((area(feature) / 10000) * 100) / 100;
    navigate(returnTo, {
      state: {
        collectionAreaSummary: {
          polygonCount: aois.length,
          areaHectares,
          becZones: becCheck.becZones,
          savedAt: new Date().toISOString()
        }
      }
    });
  };

  /**
   * Capture the Leaflet map as a raster image and open a print window.
   * Implementation lives in `../printMap.ts` so the standalone
   * `<MapToolbar>` can share the same flow without duplicating the
   * html2canvas dance.
   */
  const onPrint = () => printMap({ seedlotNumber, theme });

  /**
   * Toggle fullscreen on the seedlot map workspace. We fullscreen the
   * `.seedlot-map-workspace` element (not the bare `.leaflet-container`)
   * so the AOI toolbar, search box, side cards, and zoom control all
   * remain visible — fullscreening only the leaflet container would
   * strand the user without an exit affordance other than the Esc key.
   * Falls back to the leaflet container itself if the workspace selector
   * isn't found (shouldn't happen, but defensive).
   */
  const onToggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
      return;
    }
    const target = (document.querySelector('.seedlot-map-workspace')
      ?? document.querySelector('.leaflet-container')) as HTMLElement | null;
    target?.requestFullscreen?.();
  };

  /**
   * Trigger the hidden native file input when the user clicks the
   * Import Shape File button. Reset the input's value first so the
   * same file can be selected twice in a row (the `change` event
   * doesn't fire for identical file paths).
   */
  const onImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  /**
   * Parse the selected file via `importShapeFile` and push the resulting
   * polygons both into SparMapContext state and onto the live Leaflet
   * map as Geoman-editable layers. Errors and warnings surface via a
   * Carbon `InlineNotification`.
   */
  const handleImport = async (file: File) => {
    setValidation(null);
    setImportStatus({
      kind: 'info',
      title: 'Importing polygons',
      subtitle: `Parsing ${file.name}…`
    });
    try {
      const result = await importShapeFile(file);
      if (result.polygons.length === 0) {
        setImportStatus({
          kind: 'error',
          title: 'Nothing to import',
          subtitle:
            result.warnings.join('; ')
            || 'No polygon geometries were found in the file.'
        });
        return;
      }
      // Push to the map first so AoiDrawLayer.rebuildFromMap can pick
      // the new layers up and write an authoritative AOI list into
      // context. Calling addAoi for each one in parallel would race
      // with the rebuild inside the map control callback.
      addImportedLayersToMap(result.polygons);
      const subtitle = `${result.polygons.length} polygon${result.polygons.length === 1 ? '' : 's'} imported from ${file.name}${
        result.warnings.length > 0 ? `. ${result.warnings.join('; ')}` : '.'}`;
      setImportStatus({
        kind: result.warnings.length > 0 ? 'warning' : 'success',
        title: result.warnings.length > 0 ? 'Imported with warnings' : 'Import successful',
        subtitle
      });
    } catch (err) {
      setImportStatus({
        kind: 'error',
        title: 'Import failed',
        subtitle: err instanceof Error ? err.message : String(err)
      });
    }
  };

  const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImport(file);
    }
  };

  const renderFlyoutButtons = () => {
    switch (openGroup) {
      case 'inspect':
        return (
          <>
            <IconButton
              label={
                identifyActive
                  ? 'Identify mode ON — click a BEC zone. Click this button to stop.'
                  : 'Identify layer info (click a BEC zone on the map)'
              }
              align="bottom"
              kind="ghost"
              onClick={onToggleIdentify}
              className={groupButtonClass(identifyActive)}
              data-testid="aoi-identify"
            >
              <Information />
            </IconButton>
            <IconButton
              label={startDrawPoint ? 'Draw Point' : 'Draw Point (loading…)'}
              align="bottom"
              kind="ghost"
              onClick={onDrawPointClick}
              disabled={!startDrawPoint}
              aria-pressed={pinPanelOpen}
              className={groupButtonClass(pinPanelOpen)}
              data-testid="aoi-draw-point"
            >
              <Pin />
            </IconButton>
          </>
        );
      case 'aoi':
        return (
          <>
            <IconButton
              label="Add Polygon"
              align="bottom"
              kind="ghost"
              onClick={onAddPolygon}
              data-testid="aoi-add-polygon"
            >
              <Draw />
            </IconButton>
            <IconButton
              label="Add Rectangle"
              align="bottom"
              kind="ghost"
              onClick={onAddRectangle}
              disabled={!startDrawRectangle}
              data-testid="aoi-add-rectangle"
            >
              <Crop />
            </IconButton>
            <IconButton
              label="Add Circle"
              align="bottom"
              kind="ghost"
              onClick={onAddCircle}
              disabled={!startDrawCircle}
              data-testid="aoi-add-circle"
            >
              <CircleDash />
            </IconButton>
            <IconButton
              label="Add Line (markup only — not saved as AOI)"
              align="bottom"
              kind="ghost"
              onClick={onAddLine}
              disabled={!startDrawLine}
              data-testid="aoi-add-line"
            >
              <ConnectTarget />
            </IconButton>
            <IconButton
              label="Zoom to AOI"
              align="bottom"
              kind="ghost"
              onClick={() => zoomToAois?.()}
              disabled={!hasAoi || !zoomToAois}
              data-testid="aoi-zoom-aois"
            >
              <ZoomIn />
            </IconButton>
            <IconButton
              label="Edit Polygon (drag a vertex to move; right-click a vertex to remove it)"
              align="bottom"
              kind="ghost"
              onClick={onEditPolygon}
              disabled={!hasAoi}
              data-testid="aoi-edit-polygon"
            >
              <Edit />
            </IconButton>
            <IconButton
              label="Delete Polygon (click a polygon on the map to delete it)"
              align="bottom"
              kind="ghost"
              onClick={onDeletePolygon}
              disabled={!hasAoi}
              data-testid="aoi-delete-polygon"
            >
              <Erase />
            </IconButton>
            <IconButton
              label="Clear Last Polygon"
              align="bottom"
              kind="ghost"
              onClick={onClearLast}
              disabled={!hasAoi}
              data-testid="aoi-clear-last"
            >
              <Undo />
            </IconButton>
            <IconButton
              label="Clear All Polygons"
              align="bottom"
              kind="ghost"
              onClick={onClearAll}
              disabled={!hasAoi}
              data-testid="aoi-clear-all"
            >
              <TrashCan />
            </IconButton>
            <IconButton
              label="Validate Polygon"
              align="bottom"
              kind="ghost"
              onClick={onValidate}
              disabled={!hasAoi || isValidating}
              data-testid="aoi-validate"
            >
              <CheckmarkFilled />
            </IconButton>
            <IconButton
              label="Submit AOI to backend"
              align="bottom"
              kind="ghost"
              onClick={onSubmit}
              disabled={!hasAoi || save.isPending}
              data-testid="aoi-submit"
            >
              <Save />
            </IconButton>
            {/*
              Cancel — legacy aoi_panel parity (cwmSparmap.jsp:407,
              Sparmap.cancel → window.close()). The new app isn't a
              popup, so closest-equivalent semantics is "go back to
              whatever invoked this view". SparMapProvider unmount
              already drops the in-memory AOI list and Leaflet layers,
              so navigation-away is equivalent to discarding work.
            */}
            <IconButton
              label="Cancel — return without saving"
              align="bottom"
              kind="ghost"
              onClick={() => navigate(-1)}
              data-testid="aoi-cancel"
            >
              <Close />
            </IconButton>
          </>
        );
      case 'files':
        return (
          <>
            <IconButton
              label="Import (KML, KMZ, GeoJSON, ESRI .zip)"
              align="bottom"
              kind="ghost"
              onClick={onImportClick}
              data-testid="aoi-import-shape"
            >
              <Upload />
            </IconButton>
            <IconButton
              label="Export AOI as GeoJSON, KML, or Shapefile"
              align="bottom"
              kind="ghost"
              onClick={() => setExportOpen(true)}
              disabled={!hasAoi}
              data-testid="aoi-export"
            >
              <DocumentDownload />
            </IconButton>
          </>
        );
      case 'measure':
        return (
          <IconButton
            label="Measurement Tools"
            align="bottom"
            kind="ghost"
            onClick={() => {
              exitIdentify();
              cancelDrawPoint?.();
              cancelAoiMode?.();
              onToggleMeasureTools?.();
            }}
            aria-pressed={measureToolsOpen}
            className={groupButtonClass(measureToolsOpen)}
            data-testid="aoi-start-measure"
          >
            <Ruler />
          </IconButton>
        );
      case 'view':
        return (
          <>
            {onToggleSearch && (
              <IconButton
                label="Search"
                align="bottom"
                kind="ghost"
                onClick={onToggleSearch}
                aria-pressed={searchVisible}
                className={groupButtonClass(searchVisible)}
                data-testid="aoi-search"
              >
                <Search />
              </IconButton>
            )}
            {onToggleBookmarks && (
              <IconButton
                label="Bookmarks"
                align="bottom"
                kind="ghost"
                onClick={onToggleBookmarks}
                aria-pressed={bookmarksOpen}
                className={groupButtonClass(bookmarksOpen)}
                data-testid="aoi-bookmarks"
              >
                <Bookmark />
              </IconButton>
            )}
            <IconButton
              label="Print map"
              align="bottom"
              kind="ghost"
              onClick={onPrint}
              data-testid="aoi-print"
            >
              <Printer />
            </IconButton>
            <IconButton
              label="Add DataBC layers"
              align="bottom"
              kind="ghost"
              onClick={() => setCatalogOpen(true)}
              data-testid="aoi-layer-catalog"
            >
              <Layers />
            </IconButton>
            <IconButton
              label="Zoom to British Columbia"
              align="bottom"
              kind="ghost"
              onClick={() => zoomToBC?.()}
              disabled={!zoomToBC}
              data-testid="aoi-zoom-bc"
            >
              <ZoomReset />
            </IconButton>
            <IconButton
              label="Zoom to initial extent"
              align="bottom"
              kind="ghost"
              onClick={() => zoomToInitialExtent?.()}
              disabled={!zoomToInitialExtent}
              data-testid="aoi-zoom-extent"
            >
              <CenterToFit />
            </IconButton>
            <IconButton
              label="Toggle fullscreen"
              align="bottom"
              kind="ghost"
              onClick={onToggleFullscreen}
              data-testid="aoi-fullscreen"
            >
              <Maximize />
            </IconButton>
            <IconButton
              label={graticuleVisible ? 'Hide graticule' : 'Show graticule'}
              align="bottom"
              kind="ghost"
              onClick={() => setGraticuleVisible(!graticuleVisible)}
              aria-pressed={graticuleVisible}
              className={groupButtonClass(graticuleVisible)}
              data-testid="aoi-graticule"
            >
              <Grid />
            </IconButton>
            <IconButton
              label="Previous map view"
              align="bottom"
              kind="ghost"
              onClick={() => goBackView?.()}
              disabled={!canGoBack}
              data-testid="aoi-view-back"
            >
              <ArrowLeft />
            </IconButton>
            <IconButton
              label="Next map view"
              align="bottom"
              kind="ghost"
              onClick={() => goForwardView?.()}
              disabled={!canGoForward}
              data-testid="aoi-view-forward"
            >
              <ArrowRight />
            </IconButton>
            <IconButton
              label="Help"
              align="bottom"
              kind="ghost"
              onClick={() => setHelpOpen(true)}
              data-testid="aoi-help"
            >
              <Help />
            </IconButton>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="aoi-toolbar" data-testid="aoi-toolbar">
      {!welcomeDismissed && (
        <ActionableNotification
          kind="info"
          title="Seedlot Collection Area Tool"
          subtitle={(
            // Multi-paragraph copy mirroring the legacy cwmSparmap.jsp
            // aoi_panel welcome block (lines 381-398): explains the
            // workflow and each major action button.
            <div className="aoi-welcome__body" data-testid="aoi-welcome-body">
              <p>Welcome to the Seedlot Collection Area Tool.</p>
              <p>
                You have activated the Seedlot Collection Area Tool. You can
                use this tool to define a seedlot collection area for use in
                seedlot registration.
              </p>
              <p>
                You may add a new seedlot collection area, edit an existing
                one, or import a shape file.
              </p>
              <p>
                You may validate the polygon(s) at any time using the
                {' '}
                <strong>Validate</strong>
                {' '}
                button.
              </p>
              <p>
                When you are finished, click
                {' '}
                <strong>Submit</strong>
                {' '}
                to save and exit.
              </p>
              <p>
                To leave without saving, click
                {' '}
                <strong>Cancel</strong>
                .
              </p>
            </div>
          )}
          actionButtonLabel="Got it"
          onActionButtonClick={dismissWelcome}
          onCloseButtonClick={dismissWelcome}
          inline="classic"
          lowContrast
          data-testid="aoi-welcome"
        />
      )}
      <div className="aoi-toolbar__chrome">
        <div className="aoi-toolbar__strip aoi-toolbar__strip--main">
          <IconButton
            label="Identify and drop point tools"
            align="right"
            kind="ghost"
            onClick={() => toggleGroup('inspect')}
            aria-expanded={openGroup === 'inspect'}
            className={groupButtonClass(openGroup === 'inspect' || identifyActive || pinPanelOpen)}
            data-testid="aoi-group-inspect"
          >
            <Information />
          </IconButton>
          <IconButton
            label="Polygon AOI tools"
            align="right"
            kind="ghost"
            onClick={() => toggleGroup('aoi')}
            aria-expanded={openGroup === 'aoi'}
            className={groupButtonClass(openGroup === 'aoi')}
            data-testid="aoi-group-aoi"
          >
            <Draw />
          </IconButton>
          <IconButton
            label="Import and export tools"
            align="right"
            kind="ghost"
            onClick={() => toggleGroup('files')}
            aria-expanded={openGroup === 'files'}
            className={groupButtonClass(openGroup === 'files')}
            data-testid="aoi-group-files"
          >
            <Upload />
          </IconButton>
          <IconButton
            label="Measure tools"
            align="right"
            kind="ghost"
            onClick={() => toggleGroup('measure')}
            aria-expanded={openGroup === 'measure'}
            className={groupButtonClass(openGroup === 'measure')}
            data-testid="aoi-group-measure"
          >
            <Ruler />
          </IconButton>
          <IconButton
            label="Search, bookmarks, print, and layers"
            align="right"
            kind="ghost"
            onClick={() => toggleGroup('view')}
            aria-expanded={openGroup === 'view'}
            className={groupButtonClass(openGroup === 'view' || searchVisible || bookmarksOpen)}
            data-testid="aoi-group-view"
          >
            <Layers />
          </IconButton>
        </div>
        {openGroup && (
          <div
            className="aoi-toolbar__flyout"
            data-testid="aoi-toolbar-flyout"
          >
            <div className="aoi-toolbar__strip aoi-toolbar__strip--flyout">
              {renderFlyoutButtons()}
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
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMPORT_EXTENSIONS}
        onChange={onFileSelected}
        style={{ display: 'none' }}
        data-testid="aoi-import-shape-input"
      />
      {validation && (
        <InlineNotification
          kind={validation.kind}
          title={validation.title}
          subtitle={validation.subtitle}
          lowContrast
          data-testid="aoi-validation-notification"
        />
      )}
      {/* Live-during-edit validation banner — visible only when the
          live check has flagged an issue with the current polygon set.
          Suppressed while a manual Validate-click notification is up
          to avoid stacking two near-identical messages. Mirrors the
          legacy SPAR `addPoint` flow that warned operators on every
          vertex add when the in-progress polygon was invalid. */}
      {!validation && liveAoiValidation && !liveAoiValidation.ok && (
        <InlineNotification
          kind="warning"
          title="Polygon is not valid"
          subtitle={liveAoiValidation.message}
          lowContrast
          hideCloseButton
          data-testid="aoi-live-validation-notification"
        />
      )}
      {importStatus && (
        <InlineNotification
          kind={importStatus.kind}
          title={importStatus.title}
          subtitle={importStatus.subtitle}
          lowContrast
          onCloseButtonClick={() => setImportStatus(null)}
          data-testid="aoi-import-notification"
        />
      )}
      {save.isError && (
        <InlineNotification
          kind="error"
          title="Save failed"
          subtitle={formatSaveError(save.error)}
          lowContrast
          data-testid="aoi-save-error"
        />
      )}
      {save.isSuccess && (
        <InlineNotification
          kind="success"
          title="Polygon saved"
          lowContrast
          data-testid="aoi-save-success"
        />
      )}
      <ExportMenu
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        seedlotNumber={seedlotNumber}
      />
      <LayerCatalogModal
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
      />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      {/*
        Loading mask — legacy aoi_panel parity (cwmSparmap.jsp:362 +
        sparmap.js:734, 760, 772). Covers the viewport while the save
        or validate AJAX round-trip is in flight.
      */}
      {(save.isPending || isValidating) && (
        <LoadingMask
          message={save.isPending ? 'Saving polygon…' : 'Validating polygon…'}
        />
      )}
    </div>
  );
};

export default AoiToolbar;
