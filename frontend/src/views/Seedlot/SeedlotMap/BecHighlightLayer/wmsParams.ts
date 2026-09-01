import { NOT_SUITABLE_SLD_BODY, SUITABLE_SLD_BODY } from './sld';

export const BEC_WMS_URL = 'https://openmaps.gov.bc.ca/geo/pub/wms';
const BEC_LAYER_NAME = 'pub:WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY';

export type BecZoneShape = 'zone' | 'mapLabel';

export interface BecHighlightWmsOptions {
  layers: string;
  format: 'image/png';
  transparent: true;
  cql_filter: string;
  sld_body: string;
}

const escapeCql = (code: string): string => code.replace(/'/g, "''");

const filterColumn = (shape: BecZoneShape): string => (shape === 'zone' ? 'ZONE' : 'MAP_LABEL');

/**
 * Build the option bag for `L.tileLayer.wms(BEC_WMS_URL, opts)` so the
 * BEC overlay is filtered to only the supplied codes.
 *
 * Suitable codes render with the legacy SPAR gold `#D5C262` fill + red
 * `#FF0301` stroke (matches `sparmapIdentifyBec.js:84-96` defaults).
 * Not-suitable codes (flagged via the legacy `_` suffix on `beczone=`)
 * render in purple via the `NOT_SUITABLE_SLD_BODY` SLD.
 */
export const buildBecHighlightWmsOptions = (
  codes: string[],
  shape: BecZoneShape,
  isNotSuit: boolean
): BecHighlightWmsOptions => {
  const inList = codes.map((c) => `'${escapeCql(c)}'`).join(',');
  return {
    layers: BEC_LAYER_NAME,
    format: 'image/png',
    transparent: true,
    cql_filter: `${filterColumn(shape)} IN (${inList})`,
    sld_body: isNotSuit ? NOT_SUITABLE_SLD_BODY : SUITABLE_SLD_BODY
  };
};
