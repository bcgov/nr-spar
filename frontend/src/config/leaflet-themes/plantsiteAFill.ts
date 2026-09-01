import type { SparMapThemeProfile } from '../../types/SparMapTypes';
import { themeOverlaysWithDefaults } from '../legacy-spar-layers';

/**
 * plantsiteAFill — Plant Site Class A with filled BEC polygons. Same layer
 * set as plantsiteA; the legacy CWM "filled" rendering variant is a
 * styling-only difference handled at the WMS request level, not by toggling
 * a different layer set.
 */
export const plantsiteAFillProfile: SparMapThemeProfile = {
  theme: 'plantsiteAFill',
  basemap: {
    id: 'osm',
    label: 'OpenStreetMap',
    urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  },
  overlays: themeOverlaysWithDefaults(),
  defaultExtent: [
    [48.3, -139.0],
    [60.0, -114.0]
  ],
  // Legacy sparmap.js:459 calls `zoomTo('13')` after `toExtent(extent)`.
  initialZoom: 13,
  drawingEnabled: false,
  showBecPanel: false,
  identifyLayer: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY'
};
