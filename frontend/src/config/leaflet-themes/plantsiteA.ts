import type { SparMapThemeProfile } from '../../types/SparMapTypes';
import { themeOverlaysWithDefaults } from '../legacy-spar-layers';
import { BC_GOV_BASEMAP } from './bcGovBasemap';

/**
 * plantsiteA — Plant Site for Class A seedlot. Same layer-panel defaults as
 * aoua; the distinction is the query — "where can this seedlot be planted"
 * vs "where was it collected" — not the layer set.
 */
export const plantsiteAProfile: SparMapThemeProfile = {
  theme: 'plantsiteA',
  basemap: BC_GOV_BASEMAP,
  overlays: themeOverlaysWithDefaults(),
  defaultExtent: [
    [48.3, -139.0],
    [60.0, -114.0]
  ],
  // Legacy sparmap.js:473 calls `zoomTo('13')` after `toExtent(extent)`.
  initialZoom: 13,
  drawingEnabled: false,
  showBecPanel: false,
  identifyLayer: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY'
};
