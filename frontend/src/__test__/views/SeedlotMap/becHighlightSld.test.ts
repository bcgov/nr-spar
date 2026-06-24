import { describe, it, expect } from 'vitest';
import { NOT_SUITABLE_SLD_BODY } from '../../../views/Seedlot/SeedlotMap/BecHighlightLayer/sld';

describe('NOT_SUITABLE_SLD_BODY', () => {
  it('targets the BEC layer by NamedLayer/Name', () => {
    expect(NOT_SUITABLE_SLD_BODY).toContain(
      '<Name>pub:WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY</Name>'
    );
  });

  it('contains a PolygonSymbolizer with #800080 fill', () => {
    expect(NOT_SUITABLE_SLD_BODY).toContain('<PolygonSymbolizer>');
    expect(NOT_SUITABLE_SLD_BODY).toContain(
      '<CssParameter name="fill">#800080</CssParameter>'
    );
  });

  it('is well-formed XML (single root, balanced tags)', () => {
    const matches = NOT_SUITABLE_SLD_BODY.match(/<StyledLayerDescriptor[^>]*>/g) ?? [];
    expect(matches.length).toBe(1);
    expect(NOT_SUITABLE_SLD_BODY.endsWith('</StyledLayerDescriptor>')).toBe(true);
  });
});
