import type { SparMapOverlayLayer } from '../types/SparMapTypes';

/**
 * The DataBC OpenMaps WMS endpoint shared by every overlay in the legacy
 * SPAR layer panel. Per the GeoServer convention used by `BecHighlightLayer`,
 * layer names are prefixed with `pub:` when sent to this endpoint.
 */
export const LEGACY_SPAR_WMS_URL = 'https://openmaps.gov.bc.ca/geo/pub/wms';

/**
 * One entry per consolidated overlay shown in the legacy SPAR layer panel.
 * The legacy JSP exposes ~25 themed layer categories (plus 24 per-species
 * Active Seedlot sub-entries that all reference the same WMS layer — those
 * are folded into a single `active_seedlots` entry here).
 *
 * `layerName` is the BCGW table/view name without the `pub:` prefix. The
 * helper `layersForTheme` adds the prefix when constructing the runtime
 * `SparMapOverlayLayer` records consumed by the React overlay panel.
 */
export interface LegacySparLayer {
  id: string;
  displayName: string;
  layerName: string;
  styles?: string;
  opacity?: number;
  minScale?: number;
  maxScale?: number;
  singleTile?: boolean;
  identifyEligible?: boolean;
  legendEligible?: boolean;
  /** Default 'wms'. 'wfs-points' renders client-side circle markers. */
  renderMode?: 'wms' | 'wfs-points';
  /** When renderMode === 'wfs-points', filter on ACTIVE_IND. */
  wfsActiveOnly?: 'YES' | 'NO' | null;
  /**
   * When renderMode === 'wfs-points', filter on VEGETATION_CODE — used
   * to generate per-species child rows like "Active Seedlots - FDC".
   */
  wfsSpeciesCode?: string;
}

/**
 * Vegetation code → common name lookup. Used to build the legacy SPAR
 * "Active Seedlots — FDC — Coastal Douglas Fir" display labels for the
 * per-species child rows that mirror the legacy layer-panel taxonomy.
 */
const SPECIES_NAMES: Record<string, string> = {
  AC: 'Poplar',
  ALNUCRI: 'Sitka Alder',
  AT: 'Trembling Aspen',
  AX: 'Poplar Hybrid',
  BA: 'Amabilis Fir',
  BG: 'Grand Fir',
  BL: 'Subalpine Fir',
  BP: 'Noble Fir',
  CW: 'Western Red Cedar',
  DG: 'Green/Sitka Alder',
  EP: 'Paper Birch',
  FDC: 'Coastal Douglas Fir',
  FDI: 'Interior Douglas Fir',
  HM: 'Mountain Hemlock',
  HW: 'Western Hemlock',
  LT: 'Tamarack',
  LW: 'Western Larch',
  PLC: 'Coastal Lodgepole Pine',
  PLI: 'Interior Lodgepole Pine',
  PW: 'White Pine',
  PY: 'Yellow Pine',
  SB: 'Black Spruce',
  SS: 'Sitka Spruce',
  SX: 'Spruce Hybrid',
  SXS: 'Sitka Spruce Unknown Hybrid',
  YC: 'Yellow Cedar'
};

/** Species set covered by the SEED_SEEDLOT_POINT_MVW layer (24 codes). */
const SEEDLOT_SPECIES = [
  'AC', 'ALNUCRI', 'AT', 'BA', 'BG', 'BL', 'BP', 'CW', 'EP', 'FDC',
  'FDI', 'HM', 'HW', 'LT', 'LW', 'PLC', 'PLI', 'PW', 'PY', 'SB',
  'SS', 'SX', 'SXS', 'YC'
];

/** Species set covered by the SEED_VEG_LOT_POINT_MVW layer (4 codes). */
const VEGLOT_SPECIES = ['AC', 'AX', 'SX', 'YC'];

/** Species + GeoServer style id for the SPZ-GRM WMS overlay rows. */
const SPZ_GRM_SPECIES: Array<{ code: string; styleId: string }> = [
  { code: 'CW', styleId: '4449' },
  { code: 'FDC', styleId: '4450' },
  { code: 'FDI', styleId: '4451' },
  { code: 'HW', styleId: '4452' },
  { code: 'LW', styleId: '4453' },
  { code: 'PLI', styleId: '4454' },
  { code: 'PW', styleId: '4455' },
  { code: 'PY', styleId: '5160' },
  { code: 'SS', styleId: '4456' },
  { code: 'SX', styleId: '4457' },
  { code: 'YC', styleId: '4458' }
];

/** Species + GeoServer style id for the SPU-GRM WMS overlay rows. */
const SPU_GRM_SPECIES: Array<{ code: string; styleId: string; nameOverride?: string }> = [
  { code: 'All', styleId: '1469', nameOverride: 'All' },
  { code: 'CW', styleId: '4435' },
  { code: 'FDI', styleId: '4436' },
  { code: 'FDC', styleId: '4437' },
  { code: 'HW', styleId: '4438' },
  { code: 'LW', styleId: '4439' },
  { code: 'PLI', styleId: '4440' },
  { code: 'PW', styleId: '4441' },
  { code: 'PY', styleId: '4473' },
  { code: 'SS', styleId: '4442' },
  { code: 'SX', styleId: '4443' },
  { code: 'YC', styleId: '4444' }
];

export const speciesLabel = (code: string, nameOverride?: string): string => {
  const name = nameOverride ?? SPECIES_NAMES[code] ?? code;
  return `${code} - ${name}`;
};

/**
 * Per-species child rows for the WFS-rendered seedlot/veglot layers.
 * Mirrors legacy's nested "Active Seedlots > AC > AT > ..." panel
 * structure — flattened into the LayersControl as separate entries
 * because Leaflet's default LayersControl doesn't support nested
 * groups. Each row fetches only its species via the WFS CQL filter.
 */
const buildWfsPointSpeciesRows = (
  parentId: string,
  parentDisplay: string,
  layerName: string,
  activeOnly: 'YES' | 'NO',
  species: string[]
): LegacySparLayer[] => species.map((code) => ({
  id: `${parentId}_${code.toLowerCase()}`,
  displayName: `${parentDisplay} - ${speciesLabel(code)}`,
  layerName,
  maxScale: 198000,
  renderMode: 'wfs-points',
  wfsActiveOnly: activeOnly,
  wfsSpeciesCode: code
}));

/**
 * Per-species WMS rows for the SPZ-GRM / SPU-GRM layers. Each row is
 * a WMS GetMap on the same source layer but with a species-specific
 * style id (server-side filter+symbology) — same approach the legacy
 * used in its `overlay-config.json`.
 */
const buildWmsSpeciesRows = (
  parentId: string,
  parentDisplay: string,
  layerName: string,
  maxScale: number,
  species: Array<{ code: string; styleId: string; nameOverride?: string }>
): LegacySparLayer[] => species.map(({ code, styleId, nameOverride }) => ({
  id: `${parentId}_${code.toLowerCase()}`,
  displayName: `${parentDisplay} - ${speciesLabel(code, nameOverride)}`,
  layerName,
  styles: styleId,
  maxScale,
  singleTile: true
}));

const BEC_LAYER_OPACITY = 0.8;
const BEC_2M_MIN_SCALE = 396000;
const BEC_250K_MIN_SCALE = 80000;
const BEC_20K_MIN_SCALE = 8000;

// Leaflet/Web Mercator scale denominator at zoom 0. Used to translate
// legacy CWM min_scale/max_scale values into Leaflet's minZoom/maxZoom.
const WEB_MERCATOR_SCALE_ZOOM_0 = 559082264.0287178;

const zoomForScale = (scale: number) => Math.log2(WEB_MERCATOR_SCALE_ZOOM_0 / scale);

const minZoomForMaxScale = (maxScale?: number) => (
  maxScale ? Math.ceil(zoomForScale(maxScale)) : undefined
);

const maxZoomForMinScale = (minScale?: number) => (
  minScale ? Math.floor(zoomForScale(minScale)) : undefined
);

/**
 * Layers that the user can click on the map to identify a feature. Mirrors
 * the legacy `identify` flag and is used by the layer panel to decide which
 * overlays light up in the identify dropdown.
 */
const IDENTIFY_LAYER_IDS = new Set<string>([
  'spz',
  'seedlot',
  'veglot',
  'spz_natural_stand',
  'spz_grm',
  'spu_grm',
  'active_seedlots',
  'expired_seedlots',
  'active_veglots',
  'expired_veglots',
  'bec_2m',
  'bec_250k',
  'bec_20k',
  'bec_subzones_250k',
  'bec_subzones_20k',
  'bec_subzones_20k_outline',
  'harvest_authority',
  'cut_blocks',
  'managed_licence',
  'timber_licence',
  'tfl_schedule_a',
  'tfl_addition',
  'tfl_deletion',
  'planting',
  'activity_treatment_unit',
  'standards_unit',
  'forest_cover_inventory',
  'forest_cover_silviculture',
  'forest_cover_reserve'
]);

/**
 * Layers that surface a legend swatch in the layer panel — superset of
 * `IDENTIFY_LAYER_IDS` (every identifiable layer carries a legend), plus the
 * BEC layers (already in the identify set, retained here for clarity).
 */
const LEGEND_LAYER_IDS = new Set<string>([...IDENTIFY_LAYER_IDS]);
LEGEND_LAYER_IDS.add('bec_subzones_250k_outline');
LEGEND_LAYER_IDS.add('bec_subzones_250k_labels');

/**
 * Master registry of every legacy SPAR overlay layer. Order is intentional:
 * matches the top-down ordering of the legacy layer panel groups
 * (Boundaries → Basemapping → Tenure → Vegetation → BEC → First Nations).
 */
const BASE_SPAR_LAYERS: LegacySparLayer[] = [
  { id: 'spz', displayName: 'SPZ', layerName: 'WHSE_FOREST_VEGETATION.SEED_PLAN_ZONE_POLY_MVW' },
  { id: 'seedlot', displayName: 'Seed Lot', layerName: 'WHSE_FOREST_VEGETATION.SEED_SEEDLOT_POINT_MVW' },
  { id: 'veglot', displayName: 'Veg Lot', layerName: 'WHSE_FOREST_VEGETATION.SEED_VEG_LOT_POINT_MVW' },
  { id: 'transportation_2m', displayName: 'Transportation - Lines (1:2M)', layerName: 'WHSE_BASEMAPPING.BC_TRANSPORT_LINES_500M' },
  { id: 'transportation_250k', displayName: 'Transportation - Lines (1:250K)', layerName: 'WHSE_BASEMAPPING.NTS_BC_TRANSPORT_LINES_125M' },
  { id: 'transportation', displayName: 'Transportation', layerName: 'WHSE_BASEMAPPING.TRIM_TRANSPORTATION_LINES' },
  {
    id: 'elevation_contours_250k',
    displayName: 'Elevation - Lines (1:250K)',
    layerName: 'WHSE_BASEMAPPING.NTS_BC_CONTOUR_LINES_125M',
    minScale: 34000,
    maxScale: 396000,
    singleTile: true
  },
  {
    id: 'elevation_contours',
    displayName: 'Elevation - Contours (1:20K)',
    layerName: 'WHSE_BASEMAPPING.TRIM_CONTOUR_LINES',
    maxScale: 40000,
    singleTile: true
  },
  {
    id: 'elevation_points',
    displayName: 'Spot Elevation',
    layerName: 'WHSE_BASEMAPPING.BC_SPOT_ELEVATION_POINTS_500M',
    maxScale: 1584000,
    singleTile: true
  },
  {
    id: 'elevation_points_20k',
    displayName: 'Elevation - Points (1:20K)',
    layerName: 'WHSE_BASEMAPPING.TRIM_CONTOUR_POINTS',
    maxScale: 64000,
    singleTile: true
  },
  { id: 'ocean', displayName: 'Ocean', layerName: 'WHSE_BASEMAPPING.NTS_BC_COASTLINE_POLYS_125M' },
  { id: 'water_polys_6m', displayName: 'Water - Polygons (1:6M)', layerName: 'WHSE_BASEMAPPING.BC_WATER_POLYS_5KM' },
  { id: 'water_polys', displayName: 'Water - Polygons', layerName: 'WHSE_BASEMAPPING.BC_RIV_LAKE_WET_POLYS_500M' },
  { id: 'water_polys_250k', displayName: 'Water - Polygons (1:250K)', layerName: 'WHSE_BASEMAPPING.NTS_BC_RIV_LAKE_WET_POLYS_125M' },
  { id: 'water_lines_6m', displayName: 'Water - Lines (1:6M)', layerName: 'WHSE_BASEMAPPING.BC_BASEMAP_LINES_5KM' },
  { id: 'water_lines', displayName: 'Water - Lines', layerName: 'WHSE_BASEMAPPING.BC_WATER_LINES_500M' },
  { id: 'water_lines_250k', displayName: 'Water - Lines (1:250K)', layerName: 'WHSE_BASEMAPPING.NTS_BC_WATER_LINES_125M' },
  { id: 'grid_bcgs20k', displayName: 'BCGS 20k Grid', layerName: 'WHSE_BASEMAPPING.BCGS_20K_GRID' },
  { id: 'grid_nts50k', displayName: 'NTS 50k Grid', layerName: 'WHSE_BASEMAPPING.NTS_50K_GRID' },
  { id: 'grid_nts250k', displayName: 'NTS 250k Grid', layerName: 'WHSE_BASEMAPPING.NTS_250K_GRID' },
  { id: 'forest_region', displayName: 'Forest Region', layerName: 'WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG' },
  { id: 'forest_district', displayName: 'Forest District', layerName: 'WHSE_ADMIN_BOUNDARIES.ADM_NR_DISTRICTS_SPG' },
  { id: 'park_protected', displayName: 'Park Protected Area', layerName: 'WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW' },
  { id: 'tree_farm_licence', displayName: 'Tree Farm Licence', layerName: 'WHSE_ADMIN_BOUNDARIES.FADM_TFL' },
  { id: 'tfl_schedule_a', displayName: 'TFL Schedule A', layerName: 'WHSE_ADMIN_BOUNDARIES.FADM_TFL_SCHED_A' },
  { id: 'tfl_addition', displayName: 'TFL Addition', layerName: 'WHSE_ADMIN_BOUNDARIES.FADM_TFL_ADDITION' },
  { id: 'tfl_deletion', displayName: 'TFL Deletion', layerName: 'WHSE_ADMIN_BOUNDARIES.FADM_TFL_DELETION' },
  { id: 'timber_supply_area', displayName: 'Timber Supply Area', layerName: 'WHSE_ADMIN_BOUNDARIES.FADM_TSA_SV' },
  { id: 'bc_timber_sales', displayName: 'BC Timber Sales', layerName: 'WHSE_ADMIN_BOUNDARIES.FADM_BCTS_AREA_SP' },
  {
    id: 'spz_natural_stand',
    displayName: 'Seed Plan Zones - Natural Stand',
    layerName: 'WHSE_FOREST_VEGETATION.SEED_PLAN_ZONE_POLY_MVW',
    styles: '4459',
    maxScale: 4752000,
    singleTile: true
  },
  { id: 'spz_grm', displayName: 'Seed Plan Zones - GRM', layerName: 'WHSE_FOREST_VEGETATION.SEED_PLAN_ZONE_POLY_MVW' },
  { id: 'spu_grm', displayName: 'Seed Plan Units - GRM', layerName: 'WHSE_FOREST_VEGETATION.SEED_PLAN_UNIT_POLY_SVW' },
  { id: 'seedlot_collection', displayName: 'Seedlot Collection Areas', layerName: 'WHSE_FOREST_VEGETATION.SEED_SEEDLOT_COLLECTION_SVW' },
  {
    // Active seedlots — client-rendered via WFS so we can show all
    // species in one fetch with per-species circle colours. Legacy SPAR
    // stacked 24 per-species WMS layers; that approach doesn't work for
    // us (the DataBC styles 4331-4378 each filter server-side to ONE
    // species, so a single-style request returns empty) and would also
    // bloat the layer panel. The `renderMode: 'wfs-points'` field
    // re-routes this entry to `<SeedlotPointsLayer>` in LeafletMap.
    id: 'active_seedlots',
    displayName: 'Active Seedlots',
    layerName: 'WHSE_FOREST_VEGETATION.SEED_SEEDLOT_POINT_MVW',
    maxScale: 198000,
    renderMode: 'wfs-points',
    wfsActiveOnly: 'YES'
  },
  {
    id: 'expired_seedlots',
    displayName: 'Expired Seedlots',
    layerName: 'WHSE_FOREST_VEGETATION.SEED_SEEDLOT_POINT_MVW',
    maxScale: 198000,
    renderMode: 'wfs-points',
    wfsActiveOnly: 'NO'
  },
  {
    id: 'active_veglots',
    displayName: 'Active Veglots',
    layerName: 'WHSE_FOREST_VEGETATION.SEED_VEG_LOT_POINT_MVW',
    maxScale: 198000,
    renderMode: 'wfs-points',
    wfsActiveOnly: 'YES'
  },
  {
    id: 'expired_veglots',
    displayName: 'Expired Veglots',
    layerName: 'WHSE_FOREST_VEGETATION.SEED_VEG_LOT_POINT_MVW',
    maxScale: 198000,
    renderMode: 'wfs-points',
    wfsActiveOnly: 'NO'
  },
  { id: 'harvest_authority', displayName: 'Harvest Authority', layerName: 'WHSE_FOREST_TENURE.FTEN_HARVEST_AUTH_POLY_SVW' },
  { id: 'cut_blocks', displayName: 'Cut Blocks', layerName: 'WHSE_FOREST_TENURE.FTEN_CUT_BLOCK_POLY_SVW' },
  { id: 'managed_licence', displayName: 'Managed Licence', layerName: 'WHSE_FOREST_TENURE.FTEN_MANAGED_LICENCE_POLY_SVW' },
  { id: 'timber_licence', displayName: 'Timber Licence', layerName: 'WHSE_FOREST_TENURE.FTEN_TIMBER_LICENCE_POLY_SVW' },
  { id: 'licence_to_cut', displayName: 'Licence to Cut', layerName: 'WHSE_FOREST_TENURE.FTEN_HARVEST_AUTH_POLY_SVW' },
  { id: 'silviculture_opening', displayName: 'Silviculture - Opening', layerName: 'WHSE_FOREST_VEGETATION.RSLT_OPENING_SVW' },
  { id: 'planting', displayName: 'Planting', layerName: 'WHSE_FOREST_VEGETATION.RSLT_PLANTING_SVW' },
  { id: 'activity_treatment_unit', displayName: 'Activity Treatment Unit', layerName: 'WHSE_FOREST_VEGETATION.RSLT_ACTIVITY_TREATMENT_SVW' },
  { id: 'standards_unit', displayName: 'Standards Unit', layerName: 'WHSE_FOREST_VEGETATION.RSLT_STANDARDS_UNIT_SVW' },
  { id: 'forest_cover_inventory', displayName: 'Forest Cover Inventory', layerName: 'WHSE_FOREST_VEGETATION.RSLT_FOREST_COVER_INV_SVW' },
  { id: 'forest_cover_silviculture', displayName: 'Forest Cover Silviculture', layerName: 'WHSE_FOREST_VEGETATION.RSLT_FOREST_COVER_SILV_SVW' },
  { id: 'forest_cover_reserve', displayName: 'Forest Cover Reserve', layerName: 'WHSE_FOREST_VEGETATION.RSLT_FOREST_COVER_RESERVE_SVW' },
  {
    id: 'bec_2m',
    displayName: 'Biogeoclimatic Zones (2M)',
    layerName: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_ZONE_2M_SPG',
    styles: '1415_1416',
    opacity: BEC_LAYER_OPACITY,
    minScale: BEC_2M_MIN_SCALE,
    singleTile: true
  },
  {
    id: 'bec_250k',
    displayName: 'Biogeoclimatic Zones (250K)',
    layerName: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_250K_SPG',
    styles: '1413_1414',
    opacity: BEC_LAYER_OPACITY,
    minScale: BEC_250K_MIN_SCALE,
    maxScale: BEC_2M_MIN_SCALE,
    singleTile: true
  },
  {
    id: 'bec_20k',
    displayName: 'Biogeoclimatic Zones (20K)',
    layerName: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_20K_SPG',
    styles: '1411_1412',
    opacity: BEC_LAYER_OPACITY,
    minScale: BEC_20K_MIN_SCALE,
    maxScale: BEC_250K_MIN_SCALE,
    singleTile: true
  },
  {
    id: 'bec_subzones_250k',
    displayName: 'Biogeoclimatic Subzones - Variants (250K)',
    layerName: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_250K_SPG',
    styles: '1414',
    opacity: BEC_LAYER_OPACITY,
    minScale: BEC_250K_MIN_SCALE,
    maxScale: BEC_2M_MIN_SCALE,
    singleTile: true
  },
  {
    id: 'bec_subzones_250k_outline',
    displayName: 'Biogeoclimatic Subzones - Variants (250K) Outline',
    layerName: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_250K_SPG',
    styles: '1413',
    opacity: BEC_LAYER_OPACITY,
    minScale: BEC_250K_MIN_SCALE,
    maxScale: BEC_2M_MIN_SCALE,
    singleTile: true
  },
  {
    id: 'bec_subzones_250k_labels',
    displayName: 'Biogeoclimatic Subzones - Variants (250K) Labels',
    layerName: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_LABEL_POINT',
    opacity: BEC_LAYER_OPACITY,
    minScale: BEC_250K_MIN_SCALE,
    maxScale: BEC_2M_MIN_SCALE,
    singleTile: true
  },
  {
    id: 'bec_subzones_20k',
    displayName: 'Biogeoclimatic Subzones - Variants (20K)',
    layerName: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_20K_SPG',
    styles: '1412',
    opacity: BEC_LAYER_OPACITY,
    minScale: BEC_20K_MIN_SCALE,
    maxScale: BEC_250K_MIN_SCALE,
    singleTile: true
  },
  {
    id: 'bec_subzones_20k_outline',
    displayName: 'Biogeoclimatic Subzones - Variants (20K) Outline',
    layerName: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_20K_SPG',
    styles: '1411',
    opacity: BEC_LAYER_OPACITY,
    minScale: BEC_20K_MIN_SCALE,
    maxScale: BEC_250K_MIN_SCALE,
    singleTile: true
  },
  { id: 'fn_treaty_areas', displayName: 'First Nations Treaty Areas', layerName: 'WHSE_LEGAL_ADMIN_BOUNDARIES.FNT_TREATY_AREA_SP' },
  { id: 'fn_treaty_lands', displayName: 'First Nations Treaty Lands', layerName: 'WHSE_LEGAL_ADMIN_BOUNDARIES.FNT_TREATY_LAND_SP' },
  // ── Per-species rows — flattened from the legacy nested panel ──
  // 24 active + 24 expired seedlot species, 4 active + 4 expired
  // veglot species, 11 SPZ-GRM species, 12 SPU-GRM species. Each is a
  // separate toggle in the LayersControl; the consolidated "Active
  // Seedlots" / "Active Veglots" rows above are kept as a convenience
  // "all species" shortcut.
  ...buildWfsPointSpeciesRows(
    'active_seedlots',
    'Active Seedlots',
    'WHSE_FOREST_VEGETATION.SEED_SEEDLOT_POINT_MVW',
    'YES',
    SEEDLOT_SPECIES
  ),
  ...buildWfsPointSpeciesRows(
    'expired_seedlots',
    'Expired Seedlots',
    'WHSE_FOREST_VEGETATION.SEED_SEEDLOT_POINT_MVW',
    'NO',
    SEEDLOT_SPECIES
  ),
  ...buildWfsPointSpeciesRows(
    'active_veglots',
    'Active Veglots',
    'WHSE_FOREST_VEGETATION.SEED_VEG_LOT_POINT_MVW',
    'YES',
    VEGLOT_SPECIES
  ),
  ...buildWfsPointSpeciesRows(
    'expired_veglots',
    'Expired Veglots',
    'WHSE_FOREST_VEGETATION.SEED_VEG_LOT_POINT_MVW',
    'NO',
    VEGLOT_SPECIES
  ),
  ...buildWmsSpeciesRows(
    'spz_grm',
    'Seed Plan Zones - GRM',
    'WHSE_FOREST_VEGETATION.SEED_PLAN_ZONE_POLY_MVW',
    4752000,
    SPZ_GRM_SPECIES
  ),
  ...buildWmsSpeciesRows(
    'spu_grm',
    'Seed Plan Units - GRM',
    'WHSE_FOREST_VEGETATION.SEED_PLAN_UNIT_POLY_SVW',
    80000,
    SPU_GRM_SPECIES
  )
];

export const LEGACY_SPAR_LAYERS: readonly LegacySparLayer[] = BASE_SPAR_LAYERS.map((entry) => ({
  ...entry,
  identifyEligible: IDENTIFY_LAYER_IDS.has(entry.id),
  legendEligible: LEGEND_LAYER_IDS.has(entry.id)
}));

const REGISTRY_BY_ID: Record<string, LegacySparLayer> = Object.fromEntries(
  LEGACY_SPAR_LAYERS.map((layer) => [layer.id, layer])
);

// Reverse lookup from the WMS `layers` value (`pub:<layerName>`) back to the
// app's display label, so the dynamic legend can show the same name the
// layer panel does instead of GeoServer's published title.
const LABEL_BY_WMS_LAYER: Record<string, string> = Object.fromEntries(
  LEGACY_SPAR_LAYERS.map((entry) => [`pub:${entry.layerName}`, entry.displayName])
);

/**
 * Resolve a WMS `layers` string (e.g. `pub:WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG`,
 * optionally comma-separated) to the legacy SPAR layer's display label.
 * Returns undefined when the layer is not in the legacy registry.
 */
export const legacyLayerLabel = (wmsLayers: string): string | undefined => {
  const first = wmsLayers.split(',')[0]?.trim() ?? wmsLayers;
  return LABEL_BY_WMS_LAYER[first];
};

/**
 * Default visibility set for the AOU A/B/B+ and plantsite themes — matches
 * the legacy `aoua-overlay-config.json` / `aoub` / `aoubplus` / `plantsite*`
 * default-on groups (Elevation, SPZ Natural Stand, Seed Source Natural
 * Stand, Active + Expired Seedlots, Active + Expired Veglots, BEC Zones,
 * BEC Subzones Variants). The per-species seedlot/veglot rows that legacy
 * spammed as ~50 WMS layers are consolidated here into single WFS-points
 * entries, so the socket-pressure that drove the earlier 4-layer minimum
 * doesn't apply.
 */
const AOU_DEFAULT_VISIBLE = new Set<string>([
  // Elevation group — all 4 sub-layers default ON in legacy
  'elevation_contours_250k',
  'elevation_contours',
  'elevation_points',
  'elevation_points_20k',
  // Seed Plan Zones - Natural Stand
  'spz_natural_stand',
  // Seed Source Natural Stand (seedlot collection polygons)
  'seedlot_collection',
  // Active + Expired Seedlots / Veglots — WFS-rendered, one fetch per layer
  'active_seedlots',
  'expired_seedlots',
  'active_veglots',
  'expired_veglots',
  // Biogeoclimatic Zones group — legacy ships 2M + 250K + 20K ON. Every
  // AOU/PLANTSITE theme handler in sparmap.js explicitly forces the 2M
  // layer on via setLayerVisiblity('Biogeoclimatic Zones', 'Biogeoclimatic
  // Zones (2M)', true) (sparmap.js:378, 394, 412, 428, 440, 452, 466).
  'bec_2m',
  'bec_250k',
  'bec_20k',
  // Biogeoclimatic Subzones Variants group — all 5 sub-layers default ON
  'bec_subzones_250k',
  'bec_subzones_250k_outline',
  'bec_subzones_250k_labels',
  'bec_subzones_20k',
  'bec_subzones_20k_outline'
]);

/**
 * Build a full overlay list using the AOU default visibility set.
 * `extraOnIds` flips additional layers ON, `forceOffIds` flips layers OFF
 * even if they're in the default set. Order is the registry order, which
 * mirrors the legacy layer panel's top-down grouping.
 */
export const themeOverlaysWithDefaults = (
  extraOnIds: readonly string[] = [],
  forceOffIds: readonly string[] = []
): SparMapOverlayLayer[] => {
  const onSet = new Set<string>([...AOU_DEFAULT_VISIBLE, ...extraOnIds]);
  const offSet = new Set<string>(forceOffIds);
  // eslint-disable-next-line no-use-before-define
  return layersForTheme(
    LEGACY_SPAR_LAYERS.map((layer) => ({
      id: layer.id,
      visible: onSet.has(layer.id) && !offSet.has(layer.id)
    }))
  );
};

/**
 * Legacy panel groups — mirrors the top-level entries in legacy
 * `aoua-overlay-config.json` etc. Each group corresponds to one
 * expandable accordion row in the legacy CWM layer panel. Child IDs
 * preserve the legacy ordering. The flat per-species child rows that
 * `LEGACY_SPAR_LAYERS` appends (active_seedlots_ac, spz_grm_cw, etc.)
 * are collected here under their parent group so the tree control can
 * render them as nested children.
 *
 * Order matches the legacy panel: Boundaries → Basemapping → Tenure →
 * Vegetation → BEC → First Nations.
 */
export interface LegacyPanelGroup {
  label: string;
  /**
   * Registry ids that appear under this group, in display order. Some
   * groups have a single entry (e.g. `Forest Region`); most have 2-30.
   * Per-species child rows are listed here too — the tree control
   * decides whether to nest them under a `selectAllCheckbox` parent.
   */
  ids: readonly string[];
  /**
   * When the registry has a single "all of this kind" consolidated row
   * AND a set of per-species child rows (e.g. `active_seedlots` +
   * `active_seedlots_ac`, `active_seedlots_at`, …), the consolidated
   * row's id goes here. The tree control renders it as the group's
   * parent layer with a `selectAllCheckbox`, and the children become
   * the species rows. When undefined, the group renders as a plain
   * collapsible parent label with no associated layer.
   */
  consolidatedId?: string;
}

const speciesChildIds = (parentId: string, codes: readonly string[]): string[] => codes.map((c) => `${parentId}_${c.toLowerCase()}`);

export const LEGACY_PANEL_GROUPS: readonly LegacyPanelGroup[] = [
  { label: 'SPZ', ids: ['spz'] },
  { label: 'Seed Lot', ids: ['seedlot'] },
  { label: 'Veg Lot', ids: ['veglot'] },
  {
    label: 'Transportation',
    ids: ['transportation_2m', 'transportation_250k', 'transportation']
  },
  {
    label: 'Elevation',
    ids: [
      'elevation_contours_250k',
      'elevation_points',
      'elevation_points_20k',
      'elevation_contours'
    ]
  },
  { label: 'Ocean', ids: ['ocean'] },
  {
    label: 'Water',
    ids: [
      'water_polys_6m',
      'water_polys',
      'water_polys_250k',
      'water_lines_6m',
      'water_lines',
      'water_lines_250k'
    ]
  },
  {
    label: 'Grids and Images',
    ids: ['grid_bcgs20k', 'grid_nts50k', 'grid_nts250k']
  },
  { label: 'Forest Region', ids: ['forest_region'] },
  {
    label: 'Forest District',
    ids: [
      'forest_district',
      'park_protected',
      'tree_farm_licence',
      'tfl_schedule_a',
      'tfl_addition',
      'tfl_deletion'
    ]
  },
  { label: 'Timber Supply Area', ids: ['timber_supply_area'] },
  { label: 'BC Timber Sales', ids: ['bc_timber_sales'] },
  {
    label: 'Seed Plan Zones - Natural Stand',
    ids: ['spz_natural_stand']
  },
  {
    label: 'Seed Plan Zones - GRM',
    consolidatedId: 'spz_grm',
    ids: ['spz_grm', ...speciesChildIds('spz_grm', SPZ_GRM_SPECIES.map((s) => s.code))]
  },
  {
    label: 'Seed Plan Units - GRM',
    consolidatedId: 'spu_grm',
    ids: ['spu_grm', ...speciesChildIds('spu_grm', SPU_GRM_SPECIES.map((s) => s.code))]
  },
  {
    label: 'Seed Source Natural Stand',
    ids: ['seedlot_collection']
  },
  {
    label: 'Active Seedlots',
    consolidatedId: 'active_seedlots',
    ids: ['active_seedlots', ...speciesChildIds('active_seedlots', SEEDLOT_SPECIES)]
  },
  {
    label: 'Expired Seedlots',
    consolidatedId: 'expired_seedlots',
    ids: ['expired_seedlots', ...speciesChildIds('expired_seedlots', SEEDLOT_SPECIES)]
  },
  {
    label: 'Active Veglots',
    consolidatedId: 'active_veglots',
    ids: ['active_veglots', ...speciesChildIds('active_veglots', VEGLOT_SPECIES)]
  },
  {
    label: 'Expired Veglots',
    consolidatedId: 'expired_veglots',
    ids: ['expired_veglots', ...speciesChildIds('expired_veglots', VEGLOT_SPECIES)]
  },
  { label: 'Harvest Authority', ids: ['harvest_authority'] },
  { label: 'Cut Blocks', ids: ['cut_blocks'] },
  { label: 'Managed Licence', ids: ['managed_licence'] },
  { label: 'Timber Licence', ids: ['timber_licence'] },
  { label: 'Licence to Cut', ids: ['licence_to_cut'] },
  {
    label: 'Silviculture',
    ids: [
      'silviculture_opening',
      'planting',
      'activity_treatment_unit',
      'standards_unit',
      'forest_cover_inventory',
      'forest_cover_silviculture',
      'forest_cover_reserve'
    ]
  },
  {
    label: 'Biogeoclimatic Zones',
    ids: ['bec_2m', 'bec_250k', 'bec_20k']
  },
  {
    label: 'Biogeoclimatic Subzones Variants',
    ids: [
      'bec_subzones_250k',
      'bec_subzones_250k_outline',
      'bec_subzones_250k_labels',
      'bec_subzones_20k',
      'bec_subzones_20k_outline'
    ]
  },
  {
    label: 'First Nations',
    ids: ['fn_treaty_areas', 'fn_treaty_lands']
  }
];

/**
 * Build a full overlay list where every layer is OFF except the supplied
 * ids. Used by themes that ship a focused subset (CBST views, COLAREA,
 * default).
 */
export const themeOverlaysOnlyOn = (
  onIds: readonly string[]
): SparMapOverlayLayer[] => {
  const onSet = new Set<string>(onIds);
  // eslint-disable-next-line no-use-before-define
  return layersForTheme(
    LEGACY_SPAR_LAYERS.map((layer) => ({
      id: layer.id,
      visible: onSet.has(layer.id)
    }))
  );
};

/**
 * Resolve a list of `{ id, visible }` selections into the full
 * `SparMapOverlayLayer[]` shape consumed by the React overlay panel. The
 * order of the input list is preserved, so callers can rely on it for the
 * layer-panel display order. Unknown ids throw — typos in theme files
 * should fail fast at module-load time.
 */
export const layersForTheme = (
  ids: { id: string; visible: boolean }[]
): SparMapOverlayLayer[] => ids.map(({ id, visible }) => {
  const entry = REGISTRY_BY_ID[id];
  if (!entry) {
    throw new Error(`Unknown legacy SPAR layer id: ${id}`);
  }
  return {
    id: entry.id,
    label: entry.displayName,
    url: LEGACY_SPAR_WMS_URL,
    layers: `pub:${entry.layerName}`,
    styles: entry.styles,
    opacity: entry.opacity,
    minScale: entry.minScale,
    maxScale: entry.maxScale,
    minZoom: minZoomForMaxScale(entry.maxScale),
    maxZoom: maxZoomForMinScale(entry.minScale),
    singleTile: entry.singleTile,
    renderMode: entry.renderMode,
    wfsActiveOnly: entry.wfsActiveOnly,
    wfsSpeciesCode: entry.wfsSpeciesCode,
    visible,
    identifyEligible: entry.identifyEligible ?? false,
    legendEligible: entry.legendEligible ?? false
  };
});
