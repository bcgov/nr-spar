import { buildBecHighlightWmsOptions } from '../../views/Seedlot/SeedlotMap/BecHighlightLayer/wmsParams';
import { NOT_SUITABLE_SLD_BODY, SUITABLE_SLD_BODY } from '../../views/Seedlot/SeedlotMap/BecHighlightLayer/sld';
import {
  buildPointHighlightWmsOptions,
  SEEDLOT_POINT_LAYER,
  VEGLOT_POINT_LAYER
} from '../../views/Seedlot/SeedlotMap/PointHighlightLayer/wmsParams';
import { buildSpzHighlightWmsOptions, SPZ_LAYER_NAME } from '../../views/Seedlot/SeedlotMap/SpzHighlightLayer/wmsParams';
import { SPZ_HIGHLIGHT_SLD_BODY } from '../../views/Seedlot/SeedlotMap/SpzHighlightLayer/sld';

describe('highlight WMS options', () => {
  describe('buildBecHighlightWmsOptions', () => {
    it('filters suitable zones by zone code', () => {
      const options = buildBecHighlightWmsOptions(['CWH', 'IDF'], 'zone', false);
      expect(options.cql_filter).toBe("ZONE IN ('CWH','IDF')");
      expect(options.sld_body).toBe(SUITABLE_SLD_BODY);
      expect(options.transparent).toBe(true);
    });

    it('filters not-suitable map labels with the not-suitable style', () => {
      const options = buildBecHighlightWmsOptions(['CWHvm1'], 'mapLabel', true);
      expect(options.cql_filter).toBe("MAP_LABEL IN ('CWHvm1')");
      expect(options.sld_body).toBe(NOT_SUITABLE_SLD_BODY);
    });

    it('rejects a list with no safe codes', () => {
      expect(() => buildBecHighlightWmsOptions(["x' OR 1=1"], 'zone', false))
        .toThrow(/No valid BEC codes/);
    });
  });

  describe('buildPointHighlightWmsOptions', () => {
    it('targets the seedlot point layer', () => {
      const options = buildPointHighlightWmsOptions('seedlot', '63001');
      expect(options.layers).toBe(SEEDLOT_POINT_LAYER);
      expect(options.cql_filter).toBe("SEEDLOT_NUMBER = '63001'");
      expect(options.sld_body).toContain(SEEDLOT_POINT_LAYER);
    });

    it('targets the veglot point layer', () => {
      const options = buildPointHighlightWmsOptions('veglot', 'V123');
      expect(options.layers).toBe(VEGLOT_POINT_LAYER);
      expect(options.cql_filter).toBe("VEG_LOT_ID = 'V123'");
    });

    it('rejects unsafe identifiers', () => {
      expect(() => buildPointHighlightWmsOptions('seedlot', "1' OR '1'='1"))
        .toThrow(/Invalid seedlot or veglot identifier/);
    });
  });

  describe('buildSpzHighlightWmsOptions', () => {
    it('filters by numeric seed plan zone ids', () => {
      const options = buildSpzHighlightWmsOptions([12, 34]);
      expect(options.layers).toBe(SPZ_LAYER_NAME);
      expect(options.cql_filter).toBe('SEED_PLAN_ZONE_ID IN (12,34)');
      expect(options.sld_body).toBe(SPZ_HIGHLIGHT_SLD_BODY);
    });
  });
});
