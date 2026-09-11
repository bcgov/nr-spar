import type { PathOptions } from 'leaflet';

/**
 * Visual style applied to every AOI polygon — both ones drawn freehand
 * via Geoman and ones imported from KML/KMZ/Shapefile.
 *
 * Matches the legacy SPAR `cwmSparmap.jsp` collection-area style:
 *   - red stroke (#ff0000) at 2 px
 *   - light gray fill (#888888) at 30% opacity
 *
 * Kept in a dedicated module so both the imported-polygon constructor
 * in `AoiDrawLayer` and the Geoman draw/edit defaults use the exact
 * same object — drift between the two paths would mean drawn polygons
 * look different from imported ones, which would confuse operators
 * mid-edit.
 */
export const LEGACY_AOI_STYLE: PathOptions = {
  color: '#ff0000',
  weight: 2,
  fillColor: '#888888',
  fillOpacity: 0.3
};
