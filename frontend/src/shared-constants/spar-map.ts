/**
 * Hard-coded WFS/WMS endpoints shared by all SPAR map themes.
 *
 * Per-environment GeoServer hosts (geo.nrs.gov.bc.ca for PROD,
 * t1geo.nrs.gov.bc.ca for DEV/TEST) are referenced from the per-theme
 * profile configs in `frontend/src/config/leaflet-themes/`.
 */
export const OPENMAPS_WFS_URL = 'https://openmaps.gov.bc.ca/geo/pub/ows';

export const BEC_QUERY_LAYER = 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY';
export const SPZ_QUERY_LAYER = 'WHSE_FOREST_VEGETATION.SEED_PLAN_ZONE_POLY_MVW';
export const SEEDLOT_QUERY_LAYER = 'WHSE_FOREST_VEGETATION.SEED_SEEDLOT_POINT_MVW';
export const VEGLOT_QUERY_LAYER = 'WHSE_FOREST_VEGETATION.SEED_VEG_LOT_POINT_MVW';

/** localStorage key for in-progress AOI polygon (matches the legacy `pts` key). */
export const AOI_LOCALSTORAGE_KEY = 'pts';
