import type { SparMapThemeProfile } from '../../types/SparMapTypes';
import { themeOverlaysOnlyOn } from '../legacy-spar-layers';

/**
 * AOUCBST — Climate-Based Seed Transfer Area of Use. Matches the legacy
 * `cbst-overlay-config.json:1374-1390` defaults: Active Seedlots, Active
 * Veglots, and exactly ONE BEC Subzones Variants sub-layer (250K colour
 * fill — `SPAR_BEC_BIOGEOCLIMATIC_250K_COLOUR_THEMED_SPG`). The full
 * registry remains in the panel and toggleable; legacy never enabled
 * the 20K, outline, or label sub-layers on AOUCBST by default.
 */
export const aoucbstProfile: SparMapThemeProfile = {
  theme: 'AOUCBST',
  basemap: {
    id: 'osm',
    label: 'OpenStreetMap',
    urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  },
  overlays: themeOverlaysOnlyOn([
    'active_seedlots',
    'active_veglots',
    'bec_subzones_250k'
  ]),
  defaultExtent: [
    [48.3, -139.0],
    [60.0, -114.0]
  ],
  // Legacy sparmap.js:351 calls `zoomTo('8')` after `toExtent(extent)`.
  initialZoom: 8,
  drawingEnabled: false,
  showBecPanel: true,
  identifyLayer: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY'
};
