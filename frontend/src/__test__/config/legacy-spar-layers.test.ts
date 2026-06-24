import { describe, it, expect } from 'vitest';

import { themeOverlaysWithDefaults } from '../../config/legacy-spar-layers';

describe('AOU theme defaults (themeOverlaysWithDefaults)', () => {
  // Legacy sparmap.js:378,394,412,428,440,452,466 — every AOU/PLANTSITE
  // theme handler forces `Sparmap.setLayerVisiblity('Biogeoclimatic Zones',
  // 'Biogeoclimatic Zones (2M)', true)` so the 2M base layer paints at
  // small scales. Earlier sessions trimmed `bec_2m` out of the default
  // set; this test pins it back in for legacy parity.
  it('includes Biogeoclimatic Zones (2M / 250K / 20K) so AOU themes paint at every scale', () => {
    const visibleIds = themeOverlaysWithDefaults()
      .filter((o) => o.visible)
      .map((o) => o.id);
    expect(visibleIds).toContain('bec_2m');
    expect(visibleIds).toContain('bec_250k');
    expect(visibleIds).toContain('bec_20k');
  });
});
