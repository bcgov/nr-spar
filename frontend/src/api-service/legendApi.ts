import { wgs84ToBcAlbers } from '../legacy_translated/SPR_SPATIAL_UTILS';

/**
 * The minimum a caller needs to request a legend: the WMS endpoint, the
 * layer name(s), and an optional style. Structurally satisfied by both a
 * `SparMapOverlayLayer` and a raw WMS layer read off the live map.
 */
export interface WmsLayerRef {
  url: string;
  layers: string;
  styles?: string;
}

/**
 * A single rendered legend symbol: a color swatch plus its label. Derived
 * from one GeoServer style rule. The dynamic, text-based legend renders
 * these as DOM (swatch + text) instead of the old WMS GetLegendGraphic
 * raster image — so it scales cleanly, prints as vector, and can be
 * trimmed to only the symbols present in the current map view.
 */
export interface LegendSwatch {
  geometry: 'polygon' | 'line' | 'point';
  fill: string | null;
  fillOpacity: number;
  stroke: string | null;
  strokeWidth: number;
  strokeOpacity: number;
}

export interface LegendRule {
  label: string;
  swatch: LegendSwatch;
}

/**
 * The legend for one overlay: its label plus the rules currently in view.
 * Produced by `<LegendDataLayer>` (which owns the map + bbox) and consumed
 * by `<LegendPanel>` for rendering. Overlays whose JSON legend fails or
 * returns no in-view rules are omitted, so the panel never shows a layer
 * with nothing to draw.
 */
export interface LegendOverlayData {
  id: string;
  label: string;
  rules: LegendRule[];
}

/**
 * Partial shape of GeoServer's `GetLegendGraphic&format=application/json`
 * response. We only model the fields the swatch derivation reads; the
 * server sends more (abstract, filter, raster symbolizers) that we ignore.
 */
interface GsSymbolizerBody {
  [key: string]: unknown;
  fill?: string;
  'fill-opacity'?: string | number;
  stroke?: string;
  'stroke-width'?: string | number;
  'stroke-opacity'?: string | number;
  graphics?: Array<{
    fill?: string;
    'fill-opacity'?: string | number;
    stroke?: string;
    'stroke-width'?: string | number;
  }>;
}
interface GsSymbolizer {
  Polygon?: GsSymbolizerBody;
  Line?: GsSymbolizerBody;
  Point?: GsSymbolizerBody;
}
interface GsRule {
  name?: string;
  title?: string;
  symbolizers?: GsSymbolizer[];
}
interface GsLegend {
  layerName?: string;
  title?: string;
  rules?: GsRule[];
}
export interface GsLegendResponse {
  Legend?: GsLegend[];
}

const toNumber = (value: unknown, fallback: number): number => {
  let n = NaN;
  if (typeof value === 'string') n = parseFloat(value);
  else if (typeof value === 'number') n = value;
  return Number.isFinite(n) ? n : fallback;
};

const toColor = (value: unknown): string | null => (
  typeof value === 'string' && value.trim() !== '' ? value.trim() : null
);

/**
 * Reduce one GeoServer symbolizer to a swatch. Returns null for symbolizer
 * kinds we don't render (e.g. Text/Raster), so the caller can fall through
 * to the next symbolizer on the rule.
 */
const symbolizerToSwatch = (sym: GsSymbolizer): LegendSwatch | null => {
  if (sym.Polygon) {
    const p = sym.Polygon;
    return {
      geometry: 'polygon',
      fill: toColor(p.fill),
      fillOpacity: toNumber(p['fill-opacity'], 1),
      stroke: toColor(p.stroke),
      strokeWidth: toNumber(p['stroke-width'], 1),
      strokeOpacity: toNumber(p['stroke-opacity'], 1)
    };
  }
  if (sym.Line) {
    const l = sym.Line;
    return {
      geometry: 'line',
      fill: null,
      fillOpacity: 0,
      stroke: toColor(l.stroke),
      strokeWidth: toNumber(l['stroke-width'], 2),
      strokeOpacity: toNumber(l['stroke-opacity'], 1)
    };
  }
  if (sym.Point) {
    const pt = sym.Point;
    const graphic = Array.isArray(pt.graphics) ? pt.graphics[0] : undefined;
    return {
      geometry: 'point',
      fill: toColor(graphic?.fill) ?? toColor(pt.fill),
      fillOpacity: toNumber(graphic?.['fill-opacity'] ?? pt['fill-opacity'], 1),
      stroke: toColor(graphic?.stroke) ?? toColor(pt.stroke),
      strokeWidth: toNumber(graphic?.['stroke-width'] ?? pt['stroke-width'], 1),
      strokeOpacity: 1
    };
  }
  return null;
};

const ruleToLegendRule = (rule: GsRule): LegendRule | null => {
  const symbolizers = Array.isArray(rule.symbolizers) ? rule.symbolizers : [];
  let swatch: LegendSwatch | null = null;
  for (let i = 0; i < symbolizers.length; i += 1) {
    swatch = symbolizerToSwatch(symbolizers[i]);
    if (swatch) break;
  }
  if (!swatch) return null;
  const label = toColor(rule.title) ?? toColor(rule.name) ?? 'Other';
  return { label, swatch };
};

/** A parsed legend: the layer's human-readable title plus its rules. */
export interface ParsedLegend {
  title: string | null;
  rules: LegendRule[];
}

const firstNonEmptyTitle = (legends: GsLegend[]): string | null => {
  for (let i = 0; i < legends.length; i += 1) {
    const title = legends[i]?.title;
    if (typeof title === 'string' && title.trim() !== '') return title.trim();
  }
  return null;
};

/**
 * Parse a GeoServer JSON legend response into a title + flat rules. Pure —
 * the full contract of the legend transform, unit-tested without network.
 * Flattens across multiple `Legend[]` entries (a grouped layer request can
 * return one entry per sub-layer).
 */
export const parseLegend = (json: GsLegendResponse): ParsedLegend => {
  const legends = Array.isArray(json?.Legend) ? json.Legend : [];
  return {
    title: firstNonEmptyTitle(legends),
    rules: legends
      .flatMap((legend) => (Array.isArray(legend?.rules) ? legend.rules : []))
      .map(ruleToLegendRule)
      .filter((rule): rule is LegendRule => rule !== null)
  };
};

/** Convenience accessor for just the rules of a JSON legend response. */
export const parseLegendRules = (json: GsLegendResponse): LegendRule[] => (
  parseLegend(json).rules
);

/**
 * Build a BC Albers (EPSG:3005) `minE,minN,maxE,maxN` bbox string from
 * WGS84 map-corner coordinates. DataBC's GeoServer wants BC Albers for
 * spatial filtering (same rationale as `becZonesApi`), so we reproject the
 * map's lat/lng bounds before sending them as the `hideEmptyRules` extent.
 */
export const wgs84BoundsToBcAlbersBbox = (
  swLngLat: [number, number],
  neLngLat: [number, number]
): string => {
  const [e1, n1] = wgs84ToBcAlbers(swLngLat);
  const [e2, n2] = wgs84ToBcAlbers(neLngLat);
  const minE = Math.min(e1, e2);
  const maxE = Math.max(e1, e2);
  const minN = Math.min(n1, n2);
  const maxN = Math.max(n1, n2);
  return `${minE},${minN},${maxE},${maxN}`;
};

/**
 * Build the GeoServer `GetLegendGraphic` JSON URL for one overlay. When a
 * BC Albers bbox is supplied, `hideEmptyRules:true` trims the response to
 * only the style rules that match features inside that extent — the
 * "only symbols on the map" behavior.
 */
export const buildLegendJsonUrl = (
  layer: WmsLayerRef,
  bboxBcAlbers?: string
): string => {
  const layerName = (layer.layers ?? '').split(',')[0]?.trim() ?? '';
  const params = new URLSearchParams({
    service: 'WMS',
    version: '1.3.0',
    request: 'GetLegendGraphic',
    layer: layerName,
    format: 'application/json'
  });
  if (layer.styles) {
    params.set('style', layer.styles.split(',')[0]?.trim() ?? layer.styles);
  }
  if (bboxBcAlbers) {
    params.set('LEGEND_OPTIONS', 'hideEmptyRules:true');
    params.set('srs', 'EPSG:3005');
    params.set('width', '600');
    params.set('height', '400');
    params.set('bbox', bboxBcAlbers);
  }
  const separator = layer.url.includes('?') ? '&' : '?';
  return `${layer.url}${separator}${params.toString()}`;
};

/**
 * Fetch + parse the legend rules for one overlay. Rejects on a non-2xx
 * response so the caller can fall back gracefully per overlay. Pass an
 * `AbortSignal` to cancel in-flight fetches when the view changes again.
 */
export const fetchOverlayLegend = async (
  layer: WmsLayerRef,
  bboxBcAlbers?: string,
  signal?: AbortSignal
): Promise<ParsedLegend> => {
  const res = await fetch(buildLegendJsonUrl(layer, bboxBcAlbers), { signal });
  if (!res.ok) {
    throw new Error(`GetLegendGraphic failed: ${res.status}`);
  }
  const json = (await res.json()) as GsLegendResponse;
  return parseLegend(json);
};
