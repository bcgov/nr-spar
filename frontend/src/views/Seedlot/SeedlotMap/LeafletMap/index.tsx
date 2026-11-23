import React, { useEffect } from 'react';
import {
  MapContainer,
  ZoomControl,
  AttributionControl,
  ScaleControl,
  useMap
} from 'react-leaflet';
import type L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './styles.scss';

import type { SparMapTheme } from '../../../../types/SparMapTypes';
import { getThemeProfile } from '../../../../config/leaflet-themes';
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
import MapLayersSync from '../MapLayers/MapLayersSync';

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
 * profile from the registry and renders a MapContainer. Base maps and
 * overlays are managed by `<MapLayersSync>` from the Layers panel state
 * (the panel itself is rendered outside the map, top-right).
 *
 * Per-theme behavior (identify, AOI drawing) is mounted directly so those
 * features are always active.
 */
const LeafletMap = ({ theme }: LeafletMapProps) => {
  const profile = getThemeProfile(theme);
  const { extentBounds } = useSparMap();

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

        {...(useInitialZoom
          ? { center: initialCenter, zoom: profile.initialZoom }
          : { bounds: initialBounds })}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
        preferCanvas
      >
        {/* Zoom +/− at the top-left, directly above the map toolbar. */}
        <ZoomControl position="topleft" />
        {/* Scale bar — bottom-left.
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
        {/* Base maps, theme overlays and DataBC catalog layers — applies
            the Layers panel state (MapLayersContext) to the map. */}
        <MapLayersSync theme={theme} />
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
