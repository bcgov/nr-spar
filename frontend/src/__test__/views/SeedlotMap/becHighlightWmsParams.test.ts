import { describe, it, expect } from 'vitest';
import {
  buildBecHighlightWmsOptions,
  BEC_WMS_URL,
} from '../../../views/Seedlot/SeedlotMap/BecHighlightLayer/wmsParams';
import {
  NOT_SUITABLE_SLD_BODY,
  SUITABLE_SLD_BODY,
} from '../../../views/Seedlot/SeedlotMap/BecHighlightLayer/sld';

describe('buildBecHighlightWmsOptions', () => {
  it('exposes the DataBC openmaps WMS endpoint', () => {
    expect(BEC_WMS_URL).toBe('https://openmaps.gov.bc.ca/geo/pub/wms');
  });

  it('builds a CQL filter on ZONE for shape="zone"', () => {
    const opts = buildBecHighlightWmsOptions(['IDF', 'SBS'], 'zone', false);
    expect(opts.cql_filter).toBe("ZONE IN ('IDF','SBS')");
  });

  it('builds a CQL filter on MAP_LABEL for shape="mapLabel"', () => {
    const opts = buildBecHighlightWmsOptions(['IDFmw1'], 'mapLabel', false);
    expect(opts.cql_filter).toBe("MAP_LABEL IN ('IDFmw1')");
  });

  it('escapes single quotes in zone codes (defensive)', () => {
    const opts = buildBecHighlightWmsOptions(["O'Hara"], 'zone', false);
    expect(opts.cql_filter).toBe("ZONE IN ('O''Hara')");
  });

  it('attaches the gold SUITABLE_SLD_BODY when isNotSuit=false', () => {
    const opts = buildBecHighlightWmsOptions(['IDF'], 'zone', false);
    expect(opts.sld_body).toBe(SUITABLE_SLD_BODY);
  });

  it('attaches the purple SLD when isNotSuit=true', () => {
    const opts = buildBecHighlightWmsOptions(['MH'], 'zone', true);
    expect(opts.sld_body).toBe(NOT_SUITABLE_SLD_BODY);
  });

  it('always sets layers, format, transparent', () => {
    const opts = buildBecHighlightWmsOptions(['IDF'], 'zone', false);
    expect(opts.layers).toBe('pub:WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY');
    expect(opts.format).toBe('image/png');
    expect(opts.transparent).toBe(true);
  });
});
