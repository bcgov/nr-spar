import type { SparMapThemeProfile } from '../../types/SparMapTypes';
import { themeOverlaysWithDefaults } from '../legacy-spar-layers';

/**
 * aoua — Area of Use, Class A seedlot visualization. Replicates the legacy
 * SPAR layer panel: ~25 themed overlays sourced from `legacy-spar-layers.ts`,
 * with the AOU A defaults selected (BEC 250K + subzones, SPZ + GRM/Natural
 * Stand, seed/veg lots active and expired, elevation context layers).
 */
export const aouaProfile: SparMapThemeProfile = {
  theme: 'aoua',
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
  // Legacy sparmap.js:405 calls `zoomTo('8')` after `toExtent(extent)`.
  initialZoom: 8,
  drawingEnabled: false,
  showBecPanel: false,
  identifyLayer: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY'
};
