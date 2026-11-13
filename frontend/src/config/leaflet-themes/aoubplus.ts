import type { SparMapThemeProfile } from '../../types/SparMapTypes';
import { themeOverlaysWithDefaults } from '../legacy-spar-layers';
import { BC_GOV_BASEMAP } from './bcGovBasemap';

/**
 * aoubplus — Area of Use, Class B+ seedlot visualization. Same layer-panel
 * defaults as aoua/aoub — the Class B+ distinction is in the data layer the
 * WMS returns, not the layer set the panel exposes.
 */
export const aoubplusProfile: SparMapThemeProfile = {
  theme: 'aoubplus',
  basemap: BC_GOV_BASEMAP,
  overlays: themeOverlaysWithDefaults(),
  defaultExtent: [
    [48.3, -139.0],
    [60.0, -114.0]
  ],
  // Legacy sparmap.js:421 calls `zoomTo('8')` after `toExtent(extent)`.
  initialZoom: 8,
  drawingEnabled: false,
  showBecPanel: false,
  identifyLayer: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY'
};
