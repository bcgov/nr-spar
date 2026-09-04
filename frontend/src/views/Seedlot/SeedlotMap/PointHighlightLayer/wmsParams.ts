import { cqlQuoted, isCqlSafeIdentifier } from '../../../../utils/CqlUtils';
import { buildPointHighlightSldBody } from './sld';

/**
 * GeoServer layer name for the materialized seedlot point view. Renders
 * a single point per seedlot at the lat/lng centroid recorded by SPAR.
 */
export const SEEDLOT_POINT_LAYER = 'pub:WHSE_FOREST_VEGETATION.SEED_SEEDLOT_POINT_MVW';

/** GeoServer layer name for the materialized veglot point view. */
export const VEGLOT_POINT_LAYER = 'pub:WHSE_FOREST_VEGETATION.SEED_VEG_LOT_POINT_MVW';

export type PointHighlightKind = 'seedlot' | 'veglot';

export interface PointHighlightWmsOptions {
  layers: string;
  format: 'image/png';
  transparent: true;
  cql_filter: string;
  sld_body: string;
}

const filterColumn = (kind: PointHighlightKind): string => (kind === 'seedlot' ? 'SEEDLOT_NUMBER' : 'VEG_LOT_ID');

const layerName = (kind: PointHighlightKind): string => (kind === 'seedlot' ? SEEDLOT_POINT_LAYER : VEGLOT_POINT_LAYER);

/**
 * Build the option bag for `L.tileLayer.wms(BEC_WMS_URL, opts)` so the
 * seedlot/veglot point overlay paints only the matching record in red.
 * Mirrors `buildBecHighlightWmsOptions` for shape consistency.
 */
export const buildPointHighlightWmsOptions = (
  kind: PointHighlightKind,
  value: string
): PointHighlightWmsOptions => {
  if (!isCqlSafeIdentifier(value)) {
    throw new Error('Invalid seedlot or veglot identifier for the highlight overlay');
  }
  const layer = layerName(kind);
  return {
    layers: layer,
    format: 'image/png',
    transparent: true,
    cql_filter: `${filterColumn(kind)} = ${cqlQuoted(value)}`,
    sld_body: buildPointHighlightSldBody(layer)
  };
};
