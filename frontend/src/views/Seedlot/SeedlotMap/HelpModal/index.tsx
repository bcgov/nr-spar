import React from 'react';
import {
  ComposedModal,
  ModalBody,
  ModalHeader
} from '@carbon/react';

import './styles.scss';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

interface HelpTopic {
  id: string;
  title: string;
  body: React.ReactNode;
}

/**
 * Reference content for every tool the SPAR map exposes. Mirrors the
 * structure of the legacy `assets/help.html` (1029 lines, BC Gov SPAR
 * CWM help) — one topic per tool, single-page scrollable layout with
 * a quick-jump nav at the top. Updated terminology + tools to match
 * the React/Leaflet rewrite (Geoman drawing, Carbon, WFS-rendered points,
 * elevation feature, etc.) rather than CWM-specific naming.
 */
const TOPICS: HelpTopic[] = [
  {
    id: 'intro',
    title: 'Overview',
    body: (
      <>
        <p>
          The SPAR Seed Map lets you draw and manage Areas of Interest (AOIs)
          for seedlots and veglots, identify BEC and SPZ features under a
          point, and overlay BC Gov reference data on top of basemaps.
        </p>
        <p>
          Zoom in / out sits at the top-left, with two toolbar boxes below
          it: polygon tools (draw, edit, import / export, Measure,
          Validate / Save — collection-area map only) and map tools
          (Identify, plus Close on the collection-area map). Search
          for a place in the box at the top. Help, Print, Fullscreen, the
          legend, and the Layers panel are in the top-right bar. The
          polygon statistics card sits bottom-right. The
          cursor position is shown bottom-right whenever the mouse is
          over the map.
        </p>
      </>
    )
  },
  {
    id: 'identify',
    title: 'Identify',
    body: (
      <>
        <p>
          Toggles a click-to-identify mode. While on, clicking the map
          queries DataBC for:
          {' '}
          <strong>seedlots</strong>
          {' '}
          within 1 km of the
          click point, then
          {' '}
          <strong>veglots</strong>
          {' '}
          within 1 km, then the
          {' '}
          <strong>BEC polygon</strong>
          {', then the '}
          <strong>Seed Plan Zone</strong>
          {'. '}
          The first match is displayed in a popup, and on drawing-enabled
          themes a
          {' '}
          <em>Copy as AOI</em>
          {' '}
          button copies BEC / SPZ polygon
          geometry directly into your AOI list.
        </p>
        <p>
          Click the Identify button again (or pick another tool) to exit.
        </p>
      </>
    )
  },
  {
    id: 'polygon-tools',
    title: 'Polygon AOI tools',
    body: (
      <>
        <p>
          The toolbar holds the AOI drawing workflow. The
          {' '}
          <strong>Draw</strong>
          {' '}
          button opens a shape picker:
        </p>
        <ul>
          <li>
            <strong>Polygon</strong>
            {' '}
            — freehand: click each vertex, double-click to close.
          </li>
          <li>
            <strong>Rectangle</strong>
            {' '}
            — click two opposite corners.
          </li>
          <li>
            <strong>Circle</strong>
            {' '}
            — click center, drag to set radius. It is saved as a polygon approximation.
          </li>
          <li>
            <strong>Line</strong>
            {' '}
            — non-AOI markup polyline.
          </li>
          <li>
            <strong>Zoom to AOI</strong>
            {' '}
            — fits the map to all drawn polygons.
          </li>
          <li>
            <strong>Edit Polygon</strong>
            {' '}
            — drag any vertex; insert new ones via the midpoint handles.
          </li>
          <li>
            <strong>Delete Polygon</strong>
            {' '}
            — then click the polygon to remove.
          </li>
        </ul>
        <p>The bottom of the polygon tools box finishes the job:</p>
        <ul>
          <li>
            <strong>Validate</strong>
            {' '}
            — runs topology validity (self-intersect, degenerate ring) plus the legacy
            single-BEC-zone rule.
          </li>
          <li>
            <strong>Save</strong>
            {' '}
            — validates, then applies the collection area to the registration form
            (when the map was opened from it).
          </li>
        </ul>
        <p>
          <strong>Close</strong>
          {' '}
          (in the map tools box) returns to the previous page without saving.
        </p>
        <p>
          Polygons render with the legacy SPAR red outline + light-gray fill at 30% opacity.
          Live validation runs after every vertex change; an inline warning surfaces if the
          in-progress polygon becomes invalid.
        </p>
      </>
    )
  },
  {
    id: 'import-export',
    title: 'Import / Export',
    body: (
      <>
        <p>
          <strong>Import</strong>
          {' '}
          accepts KML, KMZ, GeoJSON, and ESRI Shapefile
          (zipped). MultiPolygons are split into separate editable polygons. Non-polygon
          geometries are skipped with a warning.
        </p>
        <p>
          <strong>Export</strong>
          {' '}
          serializes the current AOI list to GeoJSON, KML,
          or Shapefile (zipped). Filenames include the seedlot number and an ISO timestamp.
        </p>
      </>
    )
  },
  {
    id: 'measure',
    title: 'Measure',
    body: (
      <>
        <p>
          Opens the Measurement Tools panel. Pick Distance, Area, or Point, then
          click the map: distance and area show next to the shape, and the panel
          keeps a running readout. Double-click to finish a line or area.
        </p>
        <p>
          Measurements are kept separate from the AOI list. Use
          {' '}
          <em>Clear</em>
          {' '}
          in the panel to remove them.
        </p>
      </>
    )
  },
  {
    id: 'view',
    title: 'View tools',
    body: (
      <>
        <p>
          Tools that don&apos;t draw or edit geometry.
        </p>
        <ul>
          <li>
            <strong>Search</strong>
            {' '}
            — BC Gov geocoder. Address / place name typeahead, click a result to fly the map there.
          </li>
          <li>
            <strong>Print</strong>
            {' '}
            — opens a print window with a snapshot of the current map.
          </li>
          <li>
            <strong>Layers</strong>
            {' '}
            — choose the base map, search and switch layers on or off, and set each
            layer&apos;s opacity. Under User Layers,
            {' '}
            <em>Add DataBC layers</em>
            {' '}
            adds curated WMS layers (parcels, roads, VRI, etc.) for this session.
          </li>
          <li>
            <strong>Fullscreen</strong>
            {' '}
            — expands the map workspace to fill the window. Press Esc to exit.
          </li>
        </ul>
      </>
    )
  },
  {
    id: 'panels',
    title: 'Side panels',
    body: (
      <>
        <p>The right-hand collapsible cards expose secondary info.</p>
        <ul>
          <li>
            <strong>Polygon statistics</strong>
            {' '}
            — per-polygon area, perimeter, vertex count, longest-edge bearing, and
            elevation range. Each row has a &quot;Show coordinates&quot; toggle for raw
            lat/lng readout.
          </li>
          <li>
            <strong>Legend</strong>
            {' '}
            — WMS GetLegendGraphic image per visible overlay.
          </li>
        </ul>
        <p>
          The BEC Zones footer (AOUCBST / PLANTSITECBST themes only) lists the BEC zone
          codes from the URL; clicking a row pans the map to the matching subzone.
        </p>
      </>
    )
  },
  {
    id: 'cursor',
    title: 'Cursor coordinates',
    body: (
      <>
        <p>
          The bottom-right cursor readout shows the mouse position in three formats:
        </p>
        <ul>
          <li>
            <strong>Lat/Lng</strong>
            {' '}
            in degrees-minutes-seconds (e.g. 49° 30&apos; 12.4&quot; N)
          </li>
          <li>
            <strong>BC Albers</strong>
            {' '}
            easting / northing in metres (EPSG:3005)
          </li>
          <li>
            <strong>UTM</strong>
            {' '}
            easting / northing plus zone (calculated, ±1 m)
          </li>
        </ul>
      </>
    )
  },
  {
    id: 'url-params',
    title: 'URL parameters',
    body: (
      <>
        <p>The map view honours these query-string parameters:</p>
        <ul>
          <li>
            <code>theme</code>
            {' '}
            — COLAREA, AOUCBST, PLANTSITECBST, collection, aoua, aoub, aoubplus,
            plantsiteA, plantsiteAFill, plantsiteB, default.
          </li>
          <li>
            <code>extent</code>
            {' '}
            — initial bbox
            {' '}
            <code>minX,minY,maxX,maxY</code>
            {' '}
            in BC Albers (EPSG:3005).
          </li>
          <li>
            <code>seedlot</code>
            {' '}
            /
            {' '}
            <code>veglot</code>
            {' '}
            — highlight that lot&apos;s point on the map.
          </li>
          <li>
            <code>beczone</code>
            {' '}
            — comma list of BEC codes. Trailing
            {' '}
            <code>_</code>
            {' '}
            marks a code as &quot;not suitable for species&quot; (legacy convention).
          </li>
          <li>
            <code>becZone</code>
            {' '}
            — single concatenated zone+subzone+variant (camelCase). Renders one zone.
          </li>
          <li>
            <code>spz</code>
            {' '}
            — Seed Plan Zone string code.
          </li>
          <li>
            <code>spzid</code>
            {' '}
            — CSV of SEED_PLAN_ZONE_ID integers. Highlights matching polygons.
          </li>
          <li>
            <code>species</code>
            {' '}
            — VEGETATION_CODE. Filters seedlot/veglot WFS-points layers.
          </li>
        </ul>
      </>
    )
  },
  {
    id: 'validation',
    title: 'AOI validation rules',
    body: (
      <>
        <p>
          Validating or saving an AOI triggers two checks. Both must pass.
        </p>
        <ul>
          <li>
            <strong>Topology</strong>
            {' '}
            — every polygon must be OGC-valid (no self-intersecting rings, no zero-area
            or degenerate geometry). Runs via @turf/boolean-valid.
          </li>
          <li>
            <strong>Single BEC zone</strong>
            {' '}
            — the polygon (or union of polygons) must intersect exactly one BEC zone.
            If two or more zones are touched, submission is blocked and the offending
            zones light up in purple on the map. Mirrors the legacy SPAR rule that
            protected against cross-zone seed collection.
          </li>
        </ul>
      </>
    )
  },
  {
    id: 'preload',
    title: 'Loading a saved AOI',
    body: (
      <>
        <p>
          When you open the map for a seedlot that already has a saved collection-area
          polygon in DataBC, that polygon is loaded automatically as an editable
          layer and the map auto-zooms to it. Edit or extend it like any drawn polygon.
        </p>
        <p>
          If you don&apos;t see the polygon on initial load, your seedlot may not yet have
          a saved collection area in BCGW — the typical case for new seedlots.
        </p>
      </>
    )
  }
];

const HelpModal = ({ open, onClose }: HelpModalProps) => (
  <ComposedModal
    open={open}
    onClose={onClose}
    size="lg"
    data-testid="help-modal"
  >
    <ModalHeader title="SPAR Map Help" />
    <ModalBody>
      <div className="help-modal-body">
        <nav className="help-modal-nav" aria-label="Help topics">
          <ul>
            {TOPICS.map((t) => (
              <li key={t.id}>
                <a href={`#help-${t.id}`}>{t.title}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="help-modal-content">
          {TOPICS.map((t) => (
            <section
              id={`help-${t.id}`}
              key={t.id}
              className="help-modal-topic"
              data-testid={`help-topic-${t.id}`}
            >
              <h2 className="help-modal-topic__title">{t.title}</h2>
              <div className="help-modal-topic__body">{t.body}</div>
            </section>
          ))}
        </div>
      </div>
    </ModalBody>
  </ComposedModal>
);

export default HelpModal;
