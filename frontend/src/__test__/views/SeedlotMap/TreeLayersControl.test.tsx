import { describe, it, expect } from 'vitest';

import { applySpeciesVisibility } from '../../../views/Seedlot/SeedlotMap/TreeLayersControl';
import type { SparMapOverlayLayer } from '../../../types/SparMapTypes';

const overlay = (id: string, visible = false): SparMapOverlayLayer => ({
  id,
  label: id,
  url: 'https://example.com/wms',
  layers: `pub:${id}`,
  visible,
  identifyEligible: false,
  legendEligible: false,
});

describe('applySpeciesVisibility', () => {
  // Legacy sparmap.js:288-295 — themeCollection / themeAoua /
  // themePlantsitea/afill/cbst all call setLayerVisibilityBySpecies()
  // which auto-enables the matching `spz_grm_<species>` layer when
  // `species=` is in the URL. Without this hook, that param was a stub.
  it('flips the matching spz_grm_<species> overlay to visible:true when speciesCode is set', () => {
    const input = [
      overlay('elevation_contours'),
      overlay('spz_grm_FDC'),
      overlay('spz_grm_PLI'),
      overlay('bec_250k'),
    ];
    const output = applySpeciesVisibility(input, 'FDC');
    const visibleIds = output.filter((o) => o.visible).map((o) => o.id);
    expect(visibleIds).toEqual(['spz_grm_FDC']);
    // Non-matching species rows stay OFF.
    expect(output.find((o) => o.id === 'spz_grm_PLI')?.visible).toBe(false);
  });

  it('returns the overlay list unchanged when speciesCode is null', () => {
    const input = [
      overlay('spz_grm_FDC', false),
      overlay('bec_250k', true),
    ];
    const output = applySpeciesVisibility(input, null);
    expect(output.find((o) => o.id === 'spz_grm_FDC')?.visible).toBe(false);
    expect(output.find((o) => o.id === 'bec_250k')?.visible).toBe(true);
  });

  it('returns the overlay list unchanged when no spz_grm_<species> match exists', () => {
    const input = [overlay('elevation_contours'), overlay('bec_250k', true)];
    const output = applySpeciesVisibility(input, 'XYZ');
    expect(output).toEqual(input);
  });

  it('preserves the existing visible flag on the matched row (i.e. does not flip back)', () => {
    const input = [overlay('spz_grm_FDC', true)];
    const output = applySpeciesVisibility(input, 'FDC');
    expect(output[0].visible).toBe(true);
  });
});
