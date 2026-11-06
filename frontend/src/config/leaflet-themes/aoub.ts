import type { SparMapThemeProfile } from '../../types/SparMapTypes';
import { themeOverlaysWithDefaults } from '../legacy-spar-layers';
import { BC_GOV_BASEMAP } from './bcGovBasemap';

/**
 * aoub — Area of Use, Class B seedlot visualization. Same layer-panel
 * defaults as aoua (the legacy panel doesn't differentiate the two — Class
 * B just changes the seedlot data the WMS returns, not the layer set).
 */
export const aoubProfile: SparMapThemeProfile = {
  theme: 'aoub',
  basemap: BC_GOV_BASEMAP,
  overlays: themeOverlaysWithDefaults(),
  defaultExtent: [
    [48.3, -139.0],
    [60.0, -114.0]
  ],
  // Legacy sparmap.js:387 calls `zoomTo('8')` after `toExtent(extent)`.
  initialZoom: 8,
  drawingEnabled: false,
  showBecPanel: false,
  identifyLayer: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY'
};
