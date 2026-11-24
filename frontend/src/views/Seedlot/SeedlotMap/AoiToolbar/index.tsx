import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { IconButton, InlineNotification, ActionableNotification } from '@carbon/react';
import {
  Draw,
  Edit,
  Erase,
  Upload,
  CheckmarkOutline,
  Save,
  DocumentDownload,
  Ruler,
  Information,
  Crop,
  ConnectTarget,
  ZoomIn,
  Close
} from '@carbon/icons-react';

import { useSparMap } from '../../../../contexts/SparMapContext';
import { getSeedlotById } from '../../../../api-service/seedlotAPI';
import ROUTES from '../../../../routes/constants';
import { addParamToPath } from '../../../../utils/PathUtils';
import {
  validatePolygons,
  validateAoiPolygons,
  buildMultiPolygonFeature
} from './aoiValidation';
import { importShapeFile, ACCEPTED_IMPORT_FILE_EXTENSIONS } from './importShape';
import { deriveCollectionAreaResult } from '../collectionAreaResult';

import ExportMenu from './ExportMenu';
import { LoadingMask } from './LoadingMask';
import RemoveCollectionAreaModal from '../../../../components/SeedlotRegistrationSteps/BClassCollectionStep/RemoveCollectionAreaModal';

/**
 * Native `<input accept>` list. Extensions plus common MIME types so
 * Windows/macOS pickers and mime-filtering (Firefox) surface the right files.
 */
const ACCEPTED_IMPORT_EXTENSIONS = [
  ...ACCEPTED_IMPORT_FILE_EXTENSIONS,
  'application/vnd.google-earth.kml+xml',
  'application/vnd.google-earth.kmz',
  'application/zip',
  'application/geo+json',
  'application/json'
].join(',');

interface AoiToolbarProps {
  seedlotNumber: string;
  /**
   * Show the polygon tools box and the Close button. Off for view-only
   * themes, which get Identify and Measure in the map tools box.
   */
  drawingEnabled?: boolean;
  /** Whether the Measurement Tools panel is open (Measure button state). */
  measureOpen?: boolean;
  /** Open / close the Measurement Tools panel. */
  onToggleMeasure?: () => void;
}

interface InlineMessage {
  kind: 'success' | 'error' | 'info' | 'warning';
  title: string;
  subtitle?: string;
}

interface ToolButtonProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  testId: string;
  disabled?: boolean;
  /** Pressed / toggled-on state; also highlights the button. */
  active?: boolean;
}

/**
 * One square toolbar button. Tooltips open to the RIGHT of the vertical
 * rail, into the map, so they never run off the top or left edge of the
 * workspace (which clips overflow) the way the old flyout tooltips did.
 */
const ToolButton = ({
  label, onClick, children, testId, disabled = false, active
}: ToolButtonProps) => (
  <IconButton
    label={label}
    align="right"
    kind="ghost"
    onClick={onClick}
    disabled={disabled}
    aria-pressed={active}
    className={active ? 'aoi-toolbar__icon-btn--active' : ''}
    data-testid={testId}
  >
    {children}
  </IconButton>
);

/**
 * How many rows the polygon tools box can use before it has to wrap into
 * another column, so no button is ever cut off on a short screen (or a
 * zoomed-in browser). Returns null when every button fits in one column.
 *
 * @param {number} available height the box may use, in px
 * @param {number} buttonHeight height of one button, in px
 * @param {number} buttonCount number of buttons in the box
 */
export const polygonToolRows = (
  available: number,
  buttonHeight: number,
  buttonCount: number
): number | null => {
  if (buttonHeight <= 0 || buttonCount <= 0) return null;
  const fit = Math.max(1, Math.floor(available / buttonHeight));
  return fit >= buttonCount ? null : fit;
};

/**
 * localStorage key used to remember whether the user has dismissed the
 * one-time COLAREA welcome panel. Mirrors the legacy SPAR welcome text
 * from `cwmSparmap.jsp`'s `aoi_panel` — shown once for first-time
 * operators, then persistently hidden.
 */
const WELCOME_DISMISSED_KEY = 'spar-map-welcome-dismissed';

/**
 * Carbon-styled toolbar for the AOI polygon flow. Mirrors the legacy
 * SPAR `aoi_panel` button set from `cwmSparmap.jsp` / `sparmap.js` —
 * Draw, Edit, Import, Validate, Save (legacy Submit), and Close
 * (legacy Cancel). The legacy Clear Last and Clear All buttons were
 * dropped: Delete Polygon covers them.
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
 * When launched from the registration wizard (`returnTo`), Submit hands
 * derived collection-area values back via router state for draft
 * persistence. Standalone map opens validate only — geometry is written
 * to PostGIS on B-class form submission, not from this toolbar.
 *
 * Validation results surface via Carbon `InlineNotification` so the user
 * can retry without losing drawn polygons in context state.
 *
 * Layout: the one map toolbar for every theme — two boxes down the left
 * of the map, below the zoom control. "Polygon tools" (drawing, files,
 * Measure, Validate) only appears on drawing themes; "Map tools"
 * (Identify, plus Save and Close on drawing themes or Measure on view-only ones)
 * is always shown. Help, Print, Fullscreen, Legend, and Layers live in
 * the top-right bar.
 */
const AoiToolbar = ({
  seedlotNumber,
  drawingEnabled = true,
  measureOpen = false,
  onToggleMeasure
}: AoiToolbarProps) => {
  const {
    aois,
    startDraw,
    startEdit,
    startRemovalMode,
    cancelAoiMode,
    addImportedLayersToMap,
    identifyActive,
    setIdentifyActive,
    setMeasurementMode,
    startDrawRectangle,
    startDrawLine,
    zoomToAois,
    setBecZones,
    liveAoiValidation
  } = useSparMap();
  const navigate = useNavigate();
  const location = useLocation();
  // When the map is launched from a form with `returnTo`, Submit hands the
  // collection-area summary back via router state for draft persistence.
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
  // Polygon / rectangle / line all start from one Draw button
  // that opens a small shape picker beside the rail.
  const [shapePickerOpen, setShapePickerOpen] = useState(false);
  // EXPORT modal (Batch 2) — opens a Carbon Modal with a RadioButton
  // group so the user can pick GeoJSON, KML, or Shapefile. Disabled
  // whenever the AOI list is empty; the modal itself guards against a
  // zero-AOI export in case state drifts between open + submit.
  const [exportOpen, setExportOpen] = useState(false);
  // We render a hidden native file input rather than `FileUploaderButton`
  // so the import button can carry an icon and share the exact same
  // Carbon tertiary-button look as the rest of the toolbar.
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep every toolbar button on screen: measure the height the toolbar
  // has (its CSS box runs from below the zoom control to above the scale
  // bar) and, when the polygon box doesn't fit in one column, lay it out
  // in as many rows as fit so it flows into extra columns instead.
  const toolbarRef = useRef<HTMLDivElement>(null);
  const polygonStripRef = useRef<HTMLDivElement>(null);
  const [polygonRows, setPolygonRows] = useState<number | null>(null);
  useEffect(() => {
    const toolbar = toolbarRef.current;
    const strip = polygonStripRef.current;
    const rail = strip?.parentElement;
    if (!toolbar || !strip || !rail || typeof ResizeObserver === 'undefined') return undefined;
    const measure = () => {
      const button = strip.firstElementChild?.getBoundingClientRect().height ?? 0;
      const gap = parseFloat(getComputedStyle(rail).rowGap) || 0;
      const otherBoxes = [...rail.children]
        .filter((box) => box !== strip)
        .reduce((total, box) => total + box.getBoundingClientRect().height + gap, 0);
      const stripBorders = strip.offsetHeight - strip.clientHeight;
      // If the map tools box can't also fit underneath even a one-row
      // polygon box, the rail wraps it beside instead (see styles.scss),
      // so the polygon box may use the full height.
      const fitsBelow = toolbar.clientHeight - otherBoxes >= button + stripBorders;
      const available = toolbar.clientHeight - stripBorders - (fitsBelow ? otherBoxes : 0);
      setPolygonRows(polygonToolRows(available, button, strip.children.length));
    };
    // ResizeObserver reports once on observe, then on every resize.
    const observer = new ResizeObserver(measure);
    observer.observe(toolbar);
    return () => observer.disconnect();
  }, [drawingEnabled]);

  const hasAoi = aois.length > 0;
  // `returnTo` only signals a wizard launch; never navigate to its value.
  const cameFromRegistration = searchParams.has('returnTo');
  // Same key as the registration form, so this is normally a cache hit.
  // Kept off the map URL because `species=` also toggles species layers.
  const seedlotQuery = useQuery({
    queryKey: ['seedlots', seedlotNumber],
    queryFn: () => getSeedlotById(seedlotNumber),
    enabled: cameFromRegistration && !!seedlotNumber,
    refetchOnWindowFocus: false
  });
  const seedlotVegCode = seedlotQuery.data?.seedlot.vegetationCode ?? null;
  // The zone lookup needs the species. Hold Apply until this fetch settles so a
  // cold map load does not send the form a polygon with no zone.
  const waitingForSeedlotSpecies = cameFromRegistration && !!seedlotNumber && seedlotQuery.isLoading;
  const openedWithSavedArea = Boolean(
    (location.state as { initialAoiGeoJson?: string } | null)?.initialAoiGeoJson
  );
  const canRemoveSavedArea = !hasAoi && cameFromRegistration && openedWithSavedArea;
  const [isRemoveAreaOpen, setIsRemoveAreaOpen] = useState(false);

  const returnToRegistration = (state: unknown) => {
    Promise.resolve(navigate(
      `${addParamToPath(ROUTES.SEEDLOT_B_CLASS_REGISTRATION, seedlotNumber)}?step=1`,
      { state }
    )).catch(() => undefined);
  };

  // Exiting identify mode when the user switches to a drawing/edit tool
  // keeps the mode mental model simple: only one tool active at a time,
  // and the Identify button visually reflects the truth.
  const exitIdentify = () => setIdentifyActive(false);
  // Same for an active measurement: starting another tool stops it.
  const exitMeasure = () => setMeasurementMode?.(null);

  /** Start drawing a shape from the Draw picker. */
  const startShape = (start: (() => void) | null | undefined) => {
    setValidation(null);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define -- callback defined below
    highlightBecZones([]);
    exitIdentify();
    exitMeasure();
    setShapePickerOpen(false);
    start?.();
  };

  const onToggleShapePicker = () => setShapePickerOpen((open) => !open);

  const onEditPolygon = () => {
    setValidation(null);
    exitIdentify();
    exitMeasure();
    startEdit();
  };

  // Delete a single polygon: enter Geoman removal mode, then the user
  // clicks the polygon they want gone. Distinct from Clear All (wipes
  // everything).
  const onDeletePolygon = () => {
    setValidation(null);
    exitIdentify();
    exitMeasure();
    startRemovalMode();
  };

  const onToggleIdentify = () => {
    setValidation(null);
    setShapePickerOpen(false);
    exitMeasure();
    cancelAoiMode?.();
    setIdentifyActive(!identifyActive);
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
    } catch (error) {
      highlightBecZones([]);
      setValidation({
        kind: 'error',
        title: 'Validation failed',
        subtitle: error instanceof Error
          ? error.message
          : 'Unable to validate the polygon. Try again.'
      });
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
    // (validateAoiPolygons returns the zone list for the error banner).
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

    if (waitingForSeedlotSpecies) {
      return;
    }

    // Standalone map (no registration return path): validate only. Geometry is
    // persisted on B-class form submission via axios PUT .../b-class-submission.
    if (!cameFromRegistration) {
      setValidation({
        kind: 'success',
        title: 'Polygons validated',
        subtitle:
          'Collection area is valid. Open SeedMap from the registration form to apply it to the seedlot draft.'
      });
      return;
    }

    // Launched from the registration wizard: derive the collection-area
    // values and hand them (plus the raw geometry) back to the form via
    // router state. We deliberately do NOT persist here — geometry is
    // stored in the draft and only written to seedlot_collection_geometry
    // when the wizard is submitted (issue #2532: "submission only").
    setIsValidating(true);
    let result;
    try {
      result = await deriveCollectionAreaResult(
        feature,
        becCheck.becZones,
        aois.length,
        seedlotVegCode
      );
    } catch (err) {
      setValidation({
        kind: 'error',
        title: 'Could not read collection area',
        subtitle: err instanceof Error ? err.message : 'Failed to derive collection-area values.'
      });
      return;
    } finally {
      setIsValidating(false);
    }
    returnToRegistration({
      collectionAreaResult: result,
      collectionAreaSummary: {
        polygonCount: aois.length,
        areaHectares: result.areaHectares,
        becZones: becCheck.becZones,
        savedAt: new Date().toISOString()
      }
    });
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
      const plural = result.polygons.length === 1 ? '' : 's';
      const warningSuffix = result.warnings.length > 0
        ? `. ${result.warnings.join('; ')}`
        : '.';
      const subtitle = `${result.polygons.length} polygon${plural} imported from ${file.name}${warningSuffix}`;
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
      handleImport(file).catch(() => undefined);
    }
  };

  let saveLabel = 'Save — check the collection area (open the map from the registration form to apply it)';
  if (canRemoveSavedArea) {
    saveLabel = 'Remove collection area from the registration form';
  } else if (cameFromRegistration) {
    saveLabel = 'Save — apply collection area to the registration form';
  }

  return (
    <div className="aoi-toolbar" data-testid="aoi-toolbar" ref={toolbarRef}>
      <div className="aoi-toolbar__rail">
        {drawingEnabled && (
          <div
            ref={polygonStripRef}
            className="aoi-toolbar__strip aoi-toolbar__strip--wrap"
            role="toolbar"
            aria-label="Polygon tools"
            aria-orientation="vertical"
            style={polygonRows
              ? { gridAutoFlow: 'column', gridTemplateRows: `repeat(${polygonRows}, auto)` }
              : undefined}
          >
            <ToolButton
              label="Draw a polygon, rectangle, or line"
              onClick={onToggleShapePicker}
              active={shapePickerOpen}
              testId="aoi-draw"
            >
              <Draw />
            </ToolButton>
            <ToolButton
              label="Edit polygons — drag a vertex to move it, right-click a vertex to remove it"
              onClick={onEditPolygon}
              disabled={!hasAoi}
              testId="aoi-edit-polygon"
            >
              <Edit />
            </ToolButton>
            <ToolButton
              label="Delete a polygon — then click the polygon on the map"
              onClick={onDeletePolygon}
              disabled={!hasAoi}
              testId="aoi-delete-polygon"
            >
              <Erase />
            </ToolButton>
            <ToolButton
              label="Zoom to the drawn polygons"
              onClick={() => zoomToAois?.()}
              disabled={!hasAoi || !zoomToAois}
              testId="aoi-zoom-aois"
            >
              <ZoomIn />
            </ToolButton>
            <ToolButton
              label="Import polygons (KML, KMZ, GeoJSON, or zipped shapefile)"
              onClick={onImportClick}
              testId="aoi-import-shape"
            >
              <Upload />
            </ToolButton>
            <ToolButton
              label="Export polygons as GeoJSON, KML, or shapefile"
              onClick={() => setExportOpen(true)}
              disabled={!hasAoi}
              testId="aoi-export"
            >
              <DocumentDownload />
            </ToolButton>
            <ToolButton
              label="Measure distance, area, or a point's coordinates"
              onClick={() => onToggleMeasure?.()}
              active={measureOpen}
              testId="aoi-start-measure"
            >
              <Ruler />
            </ToolButton>
            <ToolButton
              label="Validate — check the polygons and their BEC zone"
              onClick={onValidate}
              disabled={!hasAoi || isValidating}
              testId="aoi-validate"
            >
              <CheckmarkOutline />
            </ToolButton>
          </div>
        )}
        <div
          className="aoi-toolbar__strip"
          role="toolbar"
          aria-label="Map tools"
          aria-orientation="vertical"
        >
          <ToolButton
            label={
              identifyActive
                ? 'Identify is on — click the map to see feature details. Click here to stop.'
                : 'Identify — click the map to see feature details'
            }
            onClick={onToggleIdentify}
            active={identifyActive}
            testId="aoi-identify"
          >
            <Information />
          </ToolButton>
          {!drawingEnabled && (
            <ToolButton
              label="Measure distance, area, or a point's coordinates"
              onClick={() => onToggleMeasure?.()}
              active={measureOpen}
              testId="aoi-start-measure"
            >
              <Ruler />
            </ToolButton>
          )}
          {drawingEnabled && (
            <>
              {/* Save sits with Close so the two ways to leave are together. */}
              <ToolButton
                label={saveLabel}
                onClick={canRemoveSavedArea ? () => setIsRemoveAreaOpen(true) : onSubmit}
                disabled={(!hasAoi && !canRemoveSavedArea) || isValidating || waitingForSeedlotSpecies}
                testId="aoi-submit"
              >
                <Save />
              </ToolButton>
              {/*
                Close — legacy aoi_panel Cancel parity (cwmSparmap.jsp:407,
                Sparmap.cancel → window.close()). The new app isn't a popup,
                so the closest equivalent is "go back to whatever opened this
                view". SparMapProvider unmount drops the in-memory AOI list
                and Leaflet layers, so closing discards unsaved work.
              */}
              <ToolButton
                label="Close the map without saving"
                onClick={() => navigate(-1)}
                testId="aoi-cancel"
              >
                <Close />
              </ToolButton>
            </>
          )}
        </div>
      </div>

      <div className="aoi-toolbar__side">
        {shapePickerOpen && (
          <div
            className="aoi-toolbar__strip aoi-toolbar__strip--picker"
            role="group"
            aria-label="Shape to draw"
            data-testid="aoi-shape-picker"
          >
            <ToolButton label="Polygon" onClick={() => startShape(startDraw)} testId="aoi-add-polygon">
              <Draw />
            </ToolButton>
            <ToolButton
              label="Rectangle"
              onClick={() => startShape(startDrawRectangle)}
              disabled={!startDrawRectangle}
              testId="aoi-add-rectangle"
            >
              <Crop />
            </ToolButton>
            <ToolButton
              label="Line (markup only — not saved with the collection area)"
              onClick={() => startShape(startDrawLine)}
              disabled={!startDrawLine}
              testId="aoi-add-line"
            >
              <ConnectTarget />
            </ToolButton>
          </div>
        )}
        {drawingEnabled && !welcomeDismissed && (
          <ActionableNotification
            kind="info"
            title="Seedlot Collection Area Tool"
            subtitle={(
              // Based on the legacy cwmSparmap.jsp aoi_panel welcome block
              // (lines 381-398), renamed to match the toolbar's Draw /
              // Validate / Save / Close buttons.
              <div className="aoi-welcome__body" data-testid="aoi-welcome-body">
                <p>
                  Use this tool to define a seedlot collection area for
                  seedlot registration.
                </p>
                <p>
                  <strong>Draw</strong>
                  {' '}
                  a new area, edit an existing one, or import a shape file.
                </p>
                <p>
                  <strong>Validate</strong>
                  {' '}
                  checks the polygons at any time.
                </p>
                <p>
                  When you are finished,
                  {' '}
                  <strong>Save</strong>
                  {' '}
                  applies the collection area to the registration form (or
                  checks it when the map was opened on its own).
                  {' '}
                  <strong>Close</strong>
                  {' '}
                  leaves without saving.
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
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMPORT_EXTENSIONS}
        onChange={onFileSelected}
        style={{ display: 'none' }}
        data-testid="aoi-import-shape-input"
      />
      <ExportMenu
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        seedlotNumber={seedlotNumber}
      />
      <RemoveCollectionAreaModal
        open={isRemoveAreaOpen}
        onClose={() => setIsRemoveAreaOpen(false)}
        onConfirm={() => {
          setIsRemoveAreaOpen(false);
          returnToRegistration({ collectionAreaCleared: true });
        }}
      />
      {/*
        Loading mask — legacy aoi_panel parity while validate / derive is in flight.
      */}
      {isValidating && (
        <LoadingMask message="Validating polygon…" />
      )}
    </div>
  );
};

export default AoiToolbar;
