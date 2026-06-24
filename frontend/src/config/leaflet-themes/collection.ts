import type { SparMapThemeProfile } from '../../types/SparMapTypes';
import { themeOverlaysWithDefaults } from '../legacy-spar-layers';

/**
 * collection — the Seedlot Collection source viewer. Matches the legacy
 * `collection-overlay-config.json`: same as AOU defaults but without
 * Expired Seedlots / Veglots and without the Biogeoclimatic Zones direct
 * group (only the Subzones Variants).
 */
export const collectionProfile: SparMapThemeProfile = {
  theme: 'collection',
  basemap: {
    id: 'osm',
    label: 'OpenStreetMap',
    urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  },
  overlays: themeOverlaysWithDefaults(
    [],
    ['expired_seedlots', 'expired_veglots', 'bec_250k', 'bec_20k']
  ),
  defaultExtent: [
    [48.3, -139.0],
    [60.0, -114.0]
  ],
  // Legacy sparmap.js:371 calls `zoomTo('13')` after `toExtent(extent)`.
  initialZoom: 13,
  drawingEnabled: false,
  showBecPanel: false,
  identifyLayer: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY'
};
