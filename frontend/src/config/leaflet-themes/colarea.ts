import type { SparMapThemeProfile } from '../../types/SparMapTypes';
import { themeOverlaysOnlyOn } from '../legacy-spar-layers';

/**
 * COLAREA — the Collection Area polygon-drawing theme. Used when a user is
 * defining the spatial extent of where seeds were collected. The only theme
 * with `drawingEnabled: true`.
 *
 * Default-visible overlay set mirrors the legacy SPAR `cwmSparmap.jsp`
 * COLAREA `overlay-config.json` — 6 conceptual groups (~39 individual
 * layers in the legacy per-species form). The new app consolidates
 * per-species rows into single layers and uses `singleTile: true` for
 * all of them so the page only fires one WMS request per overlay
 * instead of ~12 tiles each. This keeps us under Chromium's per-origin
 * socket pool while matching legacy parity. The legacy scale bounds
 * (maxScale) are preserved so layers self-hide when zoomed out beyond
 * where they're useful.
 */
export const colareaProfile: SparMapThemeProfile = {
  theme: 'COLAREA',
  basemap: {
    id: 'osm',
    label: 'OpenStreetMap',
    urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  },
  overlays: themeOverlaysOnlyOn([
    'elevation_contours_250k',
    'elevation_contours',
    'elevation_points',
    'elevation_points_20k',
    'spz_natural_stand',
    'seedlot_collection',
    // Active Seedlots + Veglots are rendered via WFS + per-species
    // circle markers (see SeedlotPointsLayer). One WFS request returns
    // all species in the viewport; client-side colouring matches the
    // legacy per-species WMS visual without the 24-layer socket cost.
    'active_seedlots',
    'active_veglots',
    'bec_subzones_250k',
    'bec_subzones_250k_outline',
    'bec_subzones_250k_labels',
    'bec_subzones_20k',
    'bec_subzones_20k_outline'
  ]),
  defaultExtent: [
    [48.3, -139.0],
    [60.0, -114.0]
  ],
  // Legacy themeColArea (sparmap.js:299-336) zooms purely to the URL
  // `extent=` param and doesn't call zoomTo() separately. We pick 13 as
  // a sensible per-theme fallback when no extent= is supplied — same
  // zoom the other drawing-adjacent themes (collection, plantsite*) use.
  initialZoom: 13,
  drawingEnabled: true,
  showBecPanel: false,
  identifyLayer: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY'
};
