import { cqlIntegerInList } from '../../../../utils/CqlUtils';
import { SPZ_HIGHLIGHT_SLD_BODY } from './sld';

/**
 * GeoServer layer name for the materialized seed-plan-zone polygon
 * view. Each polygon represents one SPZ + species combo and is keyed
 * on `SEED_PLAN_ZONE_ID` (a numeric primary key, not the human-friendly
 * `SEED_PLAN_ZONE_CODE` like "M").
 */
export const SPZ_LAYER_NAME = 'pub:WHSE_FOREST_VEGETATION.SEED_PLAN_ZONE_POLY_MVW';

export interface SpzHighlightWmsOptions {
  layers: string;
  format: 'image/png';
  transparent: true;
  cql_filter: string;
  sld_body: string;
}

/**
 * Build the option bag for `L.tileLayer.wms(BEC_WMS_URL, opts)` so the
 * SPZ overlay is filtered to only the supplied numeric IDs and styled
 * in translucent blue. Mirrors `buildBecHighlightWmsOptions` for shape
 * consistency, but the IN-list takes raw integers (no quoting) since
 * `SEED_PLAN_ZONE_ID` is a numeric column.
 */
export const buildSpzHighlightWmsOptions = (
  ids: number[]
): SpzHighlightWmsOptions => {
  const inList = cqlIntegerInList(ids);
  return {
    layers: SPZ_LAYER_NAME,
    format: 'image/png',
    transparent: true,
    cql_filter: `SEED_PLAN_ZONE_ID IN (${inList})`,
    sld_body: SPZ_HIGHLIGHT_SLD_BODY
  };
};
