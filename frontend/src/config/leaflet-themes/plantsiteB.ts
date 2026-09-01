import type { SparMapThemeProfile } from '../../types/SparMapTypes';
import { themeOverlaysWithDefaults } from '../legacy-spar-layers';

/**
 * plantsiteB — Plant Site for Class B seedlot. Same layer-panel defaults as
 * the rest of the AOU/plantsite family; the Class B distinction lives in
 * the data the WMS returns, not the layer set the panel exposes.
 */
export const plantsiteBProfile: SparMapThemeProfile = {
  theme: 'plantsiteB',
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
  // Legacy sparmap.js:445 calls `zoomTo('13')` after `toExtent(extent)`.
  initialZoom: 13,
  drawingEnabled: false,
  showBecPanel: false,
  identifyLayer: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY'
};
