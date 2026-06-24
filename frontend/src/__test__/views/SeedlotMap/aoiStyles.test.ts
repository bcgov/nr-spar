import { describe, it, expect } from 'vitest';

import { LEGACY_AOI_STYLE } from '../../../views/Seedlot/SeedlotMap/AoiDrawLayer/styles';

/**
 * The legacy `cwmSparmap.jsp` SPAR collection-area renderer used red
 * stroke + light-gray fill at 30% opacity. Operators trained on the
 * legacy map expect that visual; matching the colors keeps muscle
 * memory intact during the JSP → React migration.
 */
describe('LEGACY_AOI_STYLE', () => {
  it('matches the legacy SPAR red/gray polygon style', () => {
    expect(LEGACY_AOI_STYLE.color).toBe('#ff0000');
    expect(LEGACY_AOI_STYLE.fillColor).toBe('#888888');
    expect(LEGACY_AOI_STYLE.fillOpacity).toBe(0.3);
    expect(LEGACY_AOI_STYLE.weight).toBe(2);
  });
});
