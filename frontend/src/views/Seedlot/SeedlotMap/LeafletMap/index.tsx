import React, { useEffect, useRef } from 'react';
import {
  MapContainer,
  ZoomControl,
  AttributionControl,
  ScaleControl,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './styles.scss';

import type { SparMapTheme } from '../../../../types/SparMapTypes';
import { getThemeProfile } from '../../../../config/leaflet-themes';
import { BCGW_CATALOG, type BcgwLayer } from '../../../../config/bcgw-catalog';
import { useSparMap } from '../../../../contexts/SparMapContext';
import BecIdentifyLayer from '../BecIdentifyLayer';
import BecHighlightLayer from '../BecHighlightLayer';
import PointHighlightLayer from '../PointHighlightLayer';
import SpzHighlightLayer from '../SpzHighlightLayer';
import AoiDrawLayer from '../AoiDrawLayer';
import LegendDataLayer from '../LegendDataLayer';
import MeasureControl from '../MeasureControl';
import ViewControl from '../ViewControl';
import MarkupPointLayer from '../MarkupPointLayer';
import GraticuleLayer from '../GraticuleLayer';
import CursorPositionControl from '../CursorPositionControl';
import TreeLayersControl from '../TreeLayersControl';

interface CatalogLayersProps {
  controlRef: React.RefObject<L.Control.Layers | null>;
}

const OPENMAPS_WMS_TILE_OPTIONS = {
  tileSize: 512,
  updateWhenIdle: true,
  updateWhenZooming: false,
  keepBuffer: 1
} as const;

/**
 * Imperatively manages BCGW catalog WMS layers on the Leaflet map AND
 * registers them with the LayersControl so users can toggle visibility
 * from the control after the catalog modal closes.
 *
 * Uses `useMap()` + `useEffect()` to call `L.tileLayer.wms()` directly
 * via the Leaflet API, then registers each layer with the LayersControl
 * via `control.addOverlay()`. This sidesteps react-leaflet's limitation
 * where dynamically-added `<LayersControl.Overlay>` children don't
 * reliably render tiles.
 *
 * Flow:
 * - User checks a layer in the catalog modal → context updates →
 *   this effect adds the WMS layer to the map + registers it in the
 *   LayersControl (checked by default since it's already on the map).
 * - User unchecks in the modal → context updates → this effect removes
 *   the layer from both the map and the control.
 * - User toggles via the LayersControl → Leaflet handles add/remove
 *   natively (the control was designed for this).
 */
const CatalogLayers = ({ controlRef }: CatalogLayersProps) => {
  const map = useMap();
  const { activeCatalogLayers } = useSparMap();
  const layerRefs = useRef<Map<string, L.TileLayer.WMS>>(new Map());

  useEffect(() => {
    const control = controlRef.current;
    if (!control) return;

    const { current } = layerRefs;
    const activeSet = new Set(activeCatalogLayers);

    // Remove layers that are no longer active
    current.forEach((tileLayer, id) => {
      if (!activeSet.has(id)) {
        map.removeLayer(tileLayer);
        control.removeLayer(tileLayer);
        current.delete(id);
      }
    });

    // Add newly active layers
    activeCatalogLayers.forEach((id) => {
      if (!current.has(id)) {
        const entry = BCGW_CATALOG.find((l: BcgwLayer) => l.id === id);
        if (entry) {
          const tileLayer = L.tileLayer.wms(entry.wmsUrl, {
            layers: entry.layerName,
            format: entry.format,
            transparent: entry.transparent,
            ...OPENMAPS_WMS_TILE_OPTIONS
          });
          tileLayer.addTo(map);
          control.addOverlay(tileLayer, entry.displayName);
          current.set(id, tileLayer);
        }
      }
    });
  }, [map, activeCatalogLayers, controlRef]);

  // Cleanup on unmount
  useEffect(() => () => {
    const control = controlRef.current;
    layerRefs.current.forEach((tileLayer) => {
      map.removeLayer(tileLayer);
      if (control) control.removeLayer(tileLayer);
    });
    layerRefs.current.clear();
  }, [map, controlRef]);

  return null;
};

/**
 * Refits the Leaflet map to the URL-driven `extent=` bounds whenever the
 * `extentBounds` value in `SparMapContext` changes.
 *
 * `<MapContainer>` reads the `bounds` prop only once at mount time, so any
 * later context update (the URL-parsing useEffect in `SeedlotMapBody` runs
 * AFTER the map mounts) was being ignored. This component bridges the gap
 * by calling `map.fitBounds(extentBounds)` from inside the map tree on
 * every change.
 *
 * Mounted as a sibling of `<ZoomControl>` etc. — renders nothing.
 */
const ExtentRefit = () => {
  const map = useMap();
  const { extentBounds } = useSparMap();
  useEffect(() => {
    if (extentBounds) {
      map.fitBounds(extentBounds, { animate: false });
    }
  }, [map, extentBounds]);
  return null;
};

interface LeafletMapProps {
  theme: SparMapTheme;
}

/**
 * Compute the geographic center of a `[[s, w], [n, e]]` Leaflet bounds
 * pair (the form every theme profile uses for `defaultExtent`). Used
 * when applying `initialZoom`: Leaflet's `<MapContainer>` accepts either
 * `bounds` OR `center + zoom`, not both, so we extract the center from
 * the per-theme default extent.
 */
const getBoundsCenter = (b: L.LatLngBoundsExpression): L.LatLngExpression => {
  const arr = b as [[number, number], [number, number]];
  return [(arr[0][0] + arr[1][0]) / 2, (arr[0][1] + arr[1][1]) / 2];
};

/**
 * Top-level React-Leaflet wrapper for the SPAR map viewer. Reads the theme
 * profile from the registry and renders a MapContainer with a basemap and
 * WMS overlays wired into a top-right `<LayersControl>` panel so users can
 * toggle layer visibility at runtime. All overlays are rendered regardless
 * of their initial `visible` state — the `checked` prop on each
 * `LayersControl.Overlay` controls the default, and the user can toggle.
 *
 * Per-theme behavior (identify, AOI drawing, side panels) stays mounted
 * outside of `LayersControl` so those features are always active.
 */
const LeafletMap = ({ theme }: LeafletMapProps) => {
  const profile = getThemeProfile(theme);
  const { extentBounds } = useSparMap();
  // Ref to the Leaflet L.Control.Layers instance — react-leaflet v4
  // forwards refs on control components to the underlying Leaflet
  // instance via useImperativeHandle. CatalogLayers uses this to
  // imperatively register/unregister dynamic WMS overlays.
  const controlRef = useRef<L.Control.Layers>(null);

  // URL-param-driven extent (legacy `extent=minX,minY,maxX,maxY` in BC
  // Albers, reprojected upstream) overrides the theme default. When no
  // URL extent is present, fall back to the per-theme `initialZoom` if
  // the profile defines one (mirrors legacy
  // `Sparmap.cwmmap.olmap.zoomTo()` calls in each themeXxx handler), or
  // to the per-theme `defaultExtent` bounds otherwise.
  const hasUrlExtent = !!extentBounds;
  const initialBounds = extentBounds ?? profile.defaultExtent;
  const useInitialZoom = !hasUrlExtent && profile.initialZoom !== undefined;
  const initialCenter = useInitialZoom ? getBoundsCenter(initialBounds) : undefined;

  return (
    <div className="leaflet-map" data-testid="leaflet-map">
      <MapContainer
        // MapContainer accepts EITHER center+zoom OR bounds, never both, so
        // the prop set is chosen at runtime and must be spread.
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...(useInitialZoom
          ? { center: initialCenter, zoom: profile.initialZoom }
          : { bounds: initialBounds })}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
        preferCanvas
      >
        {/* Zoom control in the bottom-left corner — out of the way of the
            top-left AOI Tools strip, the top-right LayersControl, and the
            bottom-right CollapsibleCard stack. */}
        <ZoomControl position="bottomleft" />
        {/* Scale bar — bottom-left, stacks above the rotated zoom control.
            Shows metric + imperial so collection-area operators can sanity-
            check polygon size at a glance. Legacy CWM enabled SCALE in
            map-config.json. */}
        <ScaleControl position="bottomleft" imperial />
        {/* ExtentRefit re-fits the map whenever `extentBounds` updates in
            context. The `bounds` prop on `<MapContainer>` is captured at
            mount and ignores subsequent changes; the URL-param useEffect
            in `SeedlotMapBody` runs AFTER mount, so without this bridge
            the map never zoomed to a `?extent=` link. */}
        <ExtentRefit />
        {/* Custom attribution control with the default Leaflet prefix
            (the "Leaflet" text + Ukraine flag) suppressed. Tile-provider
            attributions (BC Gov / ESRI / OSM) still render — removing
            those would violate the providers' tile-service terms. */}
        <AttributionControl position="bottomright" prefix={false} />
        {/*
          TreeLayersControl replaces the flat react-leaflet `<LayersControl>`.
          It uses `leaflet.control.layers.tree` to render the legacy CWM
          accordion structure — grouped categories (Elevation, BEC Zones,
          Active Seedlots, etc.) with parent-checkbox-toggles-all-children
          and collapse/expand chevrons. Mounts the 4 basemaps + all
          registry overlays imperatively; default-visible overlays are
          added to the map at mount. Exposes the underlying
          `L.Control.Layers` via ref so `CatalogLayers` can keep
          dynamically adding DataBC catalog layers via `addOverlay()`.
        */}
        <TreeLayersControl theme={theme} ref={controlRef} />
        <CatalogLayers controlRef={controlRef} />
        {profile.identifyLayer && (
          <BecIdentifyLayer layerTypeName={profile.identifyLayer} />
        )}
        {/* BecHighlightLayer self-gates on `becZoneCodes` in context, so
            mounting it everywhere is a noop until the validation flow or
            the URL `beczone=` param populates the list. COLAREA uses it
            to paint the offending zones in purple when an AOI validation
            fails — gives the operator immediate visual feedback on which
            zone boundary their polygon is straddling. */}
        <BecHighlightLayer />
        {/*
          Seedlot/veglot point highlight (URL params `seedlot=` /
          `veglot=`). Theme-agnostic — every theme should be able to
          deep-link to a specific point. The component renders nothing
          when neither context field is set, so it's safe to mount
          unconditionally.
        */}
        <PointHighlightLayer />
        {/*
          SPZ polygon highlight (URL param `spzid=` CSV of integers).
          Theme-agnostic. Renders nothing when the parsed ID list is
          empty — same self-gating pattern as PointHighlightLayer.
        */}
        <SpzHighlightLayer />
        {profile.drawingEnabled && <AoiDrawLayer />}
        {/* Measure tool is theme-agnostic — every theme should be able
            to measure distances and areas. Always mounted. */}
        <MeasureControl />
        {/* CWM Markup Tools > Draw Point parity — registers the
            toolbar bridge for click-to-place red star symbols. */}
        <MarkupPointLayer />
        {/* ViewControl registers flyToLocation / getCurrentView /
            restoreView / zoomToBC / zoomToInitialExtent on the
            SparMapContext bridge so SearchControl, BookmarksPanel, and
            the toolbars (all rendered OUTSIDE MapContainer) can
            manipulate the map view. Side-effect only — renders null. */}
        <ViewControl initialBounds={initialBounds} />
        {/* Drives the dynamic legend: fetches GeoServer JSON legends for
            the visible overlays, trimmed to the current viewport, and
            pushes them to context for <LegendPanel>. Side-effect only. */}
        <LegendDataLayer />
        {/* Lat/lng graticule overlay. Self-gates on
            `graticuleVisible` context state — renders nothing when
            disabled. Theme-agnostic; available on every map. */}
        <GraticuleLayer />
        {/* Live cursor coordinate readout (legacy CWM CURSORPOS).
            Shows Lat/Lng DMS, BC Albers easting/northing, and UTM
            zone in a floating panel at the bottom-right. */}
        <CursorPositionControl />
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
