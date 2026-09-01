import type { SparMapThemeProfile } from '../../types/SparMapTypes';
import { themeOverlaysWithDefaults } from '../legacy-spar-layers';

/**
 * PLANTSITECBST — Plant Site Climate-Based Seed Transfer. Legacy
 * `plantsitecbst-overlay-config.json` ships the full AOU default-on set
 * (Elevation, SPZ Natural Stand, Seed Source Natural Stand, Active +
 * Expired Seedlots / Veglots, BEC Zones, BEC Subzones Variants).
 */
export const plantsitecbstProfile: SparMapThemeProfile = {
  theme: 'PLANTSITECBST',
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
  // Legacy sparmap.js:434 calls `zoomTo('8')` after `toExtent(extent)`.
  initialZoom: 8,
  drawingEnabled: false,
  showBecPanel: true,
  identifyLayer: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY'
};
