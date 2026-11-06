/**
 * Curated catalog of DataBC WMS layers that SPAR users can toggle on
 * for the current map session. Each entry becomes a checkbox in the
 * Layer Catalog Modal and, when active, renders as a `WMSTileLayer`
 * overlay in the Leaflet LayersControl.
 *
 * Adding a new layer: append an entry here — no other code changes
 * needed. The modal, context, and LeafletMap all read from this array.
 *
 * All layers are served from the public DataBC openmaps WMS endpoint.
 * CORS is proven by the existing WFS identify flow and WMS overlays
 * in the per-theme configs.
 */

export interface BcgwLayer {
  /** Stable key used in SparMapContext.activeCatalogLayers. */
  id: string;
  /** Human-readable name shown in the modal checkbox label. */
  displayName: string;
  /** One-line description shown below the checkbox label. */
  description: string;
  /** WMS base URL (GetMap endpoint). */
  wmsUrl: string;
  /** WMS layer name (typeName). */
  layerName: string;
  /** Image format for GetMap tiles. */
  format: string;
  /** Whether the tiles should be transparent (overlay on basemap). */
  transparent: boolean;
}

const OPENMAPS_WMS = 'https://openmaps.gov.bc.ca/geo/pub/wms';

const overlay = (
  id: string,
  displayName: string,
  description: string,
  layerName: string
): BcgwLayer => ({
  id,
  displayName,
  description,
  wmsUrl: OPENMAPS_WMS,
  layerName,
  format: 'image/png',
  transparent: true
});

export const BCGW_CATALOG: BcgwLayer[] = [
  overlay(
    'pmbc-parcels',
    'Parcel Fabric (PMBC)',
    'BC cadastral parcel boundaries',
    'pub:WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW'
  ),
  overlay(
    'resource-roads',
    'Resource Roads',
    'Forest tenure road sections',
    'pub:WHSE_FOREST_TENURE.FTEN_ROAD_SECTION_LINES_SVW'
  ),
  overlay(
    'cut-blocks',
    'Forest Tenure Cut Blocks',
    'Approved and active cut block polygons',
    'pub:WHSE_FOREST_TENURE.FTEN_CUT_BLOCK_POLY_SVW'
  ),
  overlay(
    'vri',
    'Vegetation Resources Inventory',
    'VRI forest cover polygons',
    'pub:WHSE_FOREST_VEGETATION.VEG_COMP_LYR_R1_POLY'
  ),
  overlay(
    'protected-areas',
    'Protected Areas',
    'Parks, ecological reserves, and protected areas',
    'pub:WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW'
  ),
  overlay(
    'watersheds',
    'Watersheds (Assessment)',
    'Freshwater atlas assessment watersheds',
    'pub:WHSE_BASEMAPPING.FWA_ASSESSMENT_WATERSHEDS_POLY'
  ),
  overlay(
    'fn-treaty-lands',
    'First Nations Treaty Lands',
    'Treaty settlement land polygons (Treaty 8, modern treaties — limited geographic extent)',
    'pub:WHSE_LEGAL_ADMIN_BOUNDARIES.FNT_TREATY_LAND_SP'
  ),
  overlay(
    'fn-communities',
    'First Nation Community Locations',
    'Point locations of First Nation communities across BC',
    'pub:WHSE_HUMAN_CULTURAL_ECONOMIC.FN_COMMUNITY_LOCATIONS_SP'
  )
];
