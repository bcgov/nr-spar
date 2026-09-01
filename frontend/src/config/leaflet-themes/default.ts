import type { SparMapThemeProfile } from '../../types/SparMapTypes';
import { themeOverlaysOnlyOn } from '../legacy-spar-layers';

/**
 * default — fallback profile for unknown themes. Matches the legacy
 * `default-overlay-config.json` set: only the Biogeoclimatic Subzones
 * Variants group (250K + 20K, colour + outline + labels) is ON by default;
 * the rest of the registry stays in the panel and toggleable. No
 * `identifyLayer` set, so identify clicks don't fire.
 */
export const defaultProfile: SparMapThemeProfile = {
  theme: 'default',
  basemap: {
    id: 'osm',
    label: 'OpenStreetMap',
    urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  },
  overlays: themeOverlaysOnlyOn([
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
  // Legacy sparmap.js:480 calls `zoomTo('6')` as the default fallback.
  initialZoom: 6,
  drawingEnabled: false,
  showBecPanel: false,
  identifyLayer: undefined
};
