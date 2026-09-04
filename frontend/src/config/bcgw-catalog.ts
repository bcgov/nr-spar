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

export const BCGW_CATALOG: BcgwLayer[] = [
  {
    id: 'pmbc-parcels',
    displayName: 'Parcel Fabric (PMBC)',
    description: 'BC cadastral parcel boundaries',
    wmsUrl: OPENMAPS_WMS,
    layerName: 'pub:WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW',
    format: 'image/png',
    transparent: true
  },
  {
    id: 'resource-roads',
    displayName: 'Resource Roads',
    description: 'Forest tenure road sections',
    wmsUrl: OPENMAPS_WMS,
    layerName: 'pub:WHSE_FOREST_TENURE.FTEN_ROAD_SECTION_LINES_SVW',
    format: 'image/png',
    transparent: true
  },
  {
    id: 'cut-blocks',
    displayName: 'Forest Tenure Cut Blocks',
    description: 'Approved and active cut block polygons',
    wmsUrl: OPENMAPS_WMS,
    layerName: 'pub:WHSE_FOREST_TENURE.FTEN_CUT_BLOCK_POLY_SVW',
    format: 'image/png',
    transparent: true
  },
  {
    id: 'vri',
    displayName: 'Vegetation Resources Inventory',
    description: 'VRI forest cover polygons',
    wmsUrl: OPENMAPS_WMS,
    layerName: 'pub:WHSE_FOREST_VEGETATION.VEG_COMP_LYR_R1_POLY',
    format: 'image/png',
    transparent: true
  },
  {
    id: 'protected-areas',
    displayName: 'Protected Areas',
    description: 'Parks, ecological reserves, and protected areas',
    wmsUrl: OPENMAPS_WMS,
    layerName: 'pub:WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW',
    format: 'image/png',
    transparent: true
  },
  {
    id: 'watersheds',
    displayName: 'Watersheds (Assessment)',
    description: 'Freshwater atlas assessment watersheds',
    wmsUrl: OPENMAPS_WMS,
    layerName: 'pub:WHSE_BASEMAPPING.FWA_ASSESSMENT_WATERSHEDS_POLY',
    format: 'image/png',
    transparent: true
  },
  {
    id: 'fn-treaty-lands',
    displayName: 'First Nations Treaty Lands',
    description: 'Treaty settlement land polygons (Treaty 8, modern treaties — limited geographic extent)',
    wmsUrl: OPENMAPS_WMS,
    layerName: 'pub:WHSE_LEGAL_ADMIN_BOUNDARIES.FNT_TREATY_LAND_SP',
    format: 'image/png',
    transparent: true
  },
  {
    id: 'fn-communities',
    displayName: 'First Nation Community Locations',
    description: 'Point locations of First Nation communities across BC',
    wmsUrl: OPENMAPS_WMS,
    layerName: 'pub:WHSE_HUMAN_CULTURAL_ECONOMIC.FN_COMMUNITY_LOCATIONS_SP',
    format: 'image/png',
    transparent: true
  }
];
