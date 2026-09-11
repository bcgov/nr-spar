import type { LatLngBoundsExpression } from 'leaflet';
import type { Feature, Polygon } from 'geojson';

/**
 * The 11 map themes from the legacy JSP SPAR cwmSparmap.jsp viewer.
 * Each theme corresponds to a distinct map profile (basemap + overlays +
 * identify + drawing behavior).
 */
export const SPAR_MAP_THEMES = [
  'COLAREA',
  'collection',
  'aoua',
  'aoub',
  'aoubplus',
  'AOUCBST',
  'plantsiteA',
  'plantsiteAFill',
  'plantsiteB',
  'PLANTSITECBST',
  'default'
] as const;

export type SparMapTheme = typeof SPAR_MAP_THEMES[number];

export interface SparMapUrlParams {
  theme: SparMapTheme;
  seedlotNumber?: string;
  veglot?: string;
  species?: string;
  extent?: LatLngBoundsExpression;
  /** Lowercase `beczone=IDF,MH_` comma-list, parsed via parseBecZoneParam. */
  becZoneList?: { codes: string[]; notSuit: string[] };
  /** CBST `becZone=IDFmw1` camelCase single concatenated value. */
  becZoneSingle?: string;
  spz?: string[];
  spzid?: string[];
}

export interface SparMapOverlayLayer {
  id: string;
  label: string;
  url: string;
  /** WMS layer names, comma-separated. */
  layers: string;
  /** Optional WMS styles, comma-separated to match `layers`. */
  styles?: string;
  opacity?: number;
  /** Legacy CWM scale denominator lower bound. */
  minScale?: number;
  /** Legacy CWM scale denominator upper bound. */
  maxScale?: number;
  /** Leaflet zoom range derived from the legacy scale bounds. */
  minZoom?: number;
  maxZoom?: number;
  /** CWM's `singleTile` WMS mode, used for heavy reference overlays. */
  singleTile?: boolean;
  /**
   * Rendering pipeline. Default `'wms'` — overlay is a DataBC WMS layer
   * rendered via `<WMSTileLayer>` or `<SingleTileWmsLayer>`. `'wfs-points'`
   * fetches features via WFS GeoJSON and renders them client-side as
   * Leaflet circle markers (used for seedlot/veglot point layers where
   * the legacy stacked 24+ per-species WMS layers — we get the same
   * visual result with one WFS call per viewport). The companion field
   * `wfsActiveOnly` selects active-vs-expired when renderMode is
   * `'wfs-points'`.
   */
  renderMode?: 'wms' | 'wfs-points';
  /** When `renderMode === 'wfs-points'`, filter on `ACTIVE_IND`. */
  wfsActiveOnly?: 'YES' | 'NO' | null;
  /**
   * When `renderMode === 'wfs-points'`, filter the WFS GetFeature
   * request to a single `VEGETATION_CODE`. Combined with the URL-level
   * `?species=` param (an additional filter) via CQL AND. Used to
   * generate per-species rows in the layer panel.
   */
  wfsSpeciesCode?: string;
  visible: boolean;
  identifyEligible: boolean;
  legendEligible: boolean;
}

export interface SparMapBasemap {
  id: string;
  label: string;
  urlTemplate: string;
  attribution: string;
  maxZoom?: number;
}

export interface SparMapThemeProfile {
  theme: SparMapTheme;
  basemap: SparMapBasemap;
  overlays: SparMapOverlayLayer[];
  defaultExtent: LatLngBoundsExpression;
  /**
   * Default Leaflet zoom level applied when no URL `extent=` param is
   * present. Mirrors the legacy CWM `Sparmap.cwmmap.olmap.zoomTo()` call
   * that each `themeXxx` handler in `sparmap.js` ran after
   * `zoom.toExtent()`. Omit to fall back to `defaultExtent` bounds.
   */
  initialZoom?: number;
  drawingEnabled: boolean;
  /** Show the BEC zone footer panel (AOUCBST / PLANTSITECBST themes). */
  showBecPanel: boolean;
  /** Null for the `default` theme which has no identify layer. */
  identifyLayer?: string;
}

/** A user-drawn or backend-returned polygon in WGS84 GeoJSON form. */
export type AoiPolygon = Feature<Polygon>;

/**
 * Payload handed back from the SeedMap collection-area tool to the seedlot
 * registration wizard via router state. The wizard maps these derived values
 * into the matching Step 1 form fields and stores `geoJson` in the draft.
 * Geometry is only persisted to `seedlot_collection_geometry` on submission.
 */
export interface CollectionAreaResult {
  /** GeoJSON `Feature<MultiPolygon>` serialized as a string. */
  geoJson: string;
  polygonCount: number;
  areaHectares: number;
  /** Mean latitude of all polygon vertices (decimal degrees, WGS84). */
  meanLat: number | null;
  /** Mean longitude of all polygon vertices (decimal degrees, WGS84). */
  meanLng: number | null;
  elevationMinM: number | null;
  elevationMaxM: number | null;
  /** Distinct BEC zone codes the polygon intersects. */
  becZones: string[];
  /** BEC attributes sampled at the polygon centroid, if available. */
  becVariant: {
    mapLabel: string;
    zone: string;
    subzone: string | null;
    variant: string | null;
  } | null;
}

/** Result of a WMS GetFeatureInfo / WFS identify against the BEC layer. */
export interface BecIdentifyResult {
  zoneCode: string;
  subzoneCode?: string;
  variantCode?: string;
  phaseCode?: string;
  natDisturbanceCode?: string;
  featureAreaSqm?: number;
  featureLengthM?: number;
  rawProperties?: Record<string, unknown>;
}
