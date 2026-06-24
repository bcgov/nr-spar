import { describe, expect, it } from 'vitest';

import {
  DEFAULT_COLOR,
  SPECIES_COLOR_MAP,
  colorForSpecies,
} from '../../../views/Seedlot/SeedlotMap/SeedlotPointsLayer/colors';

describe('colorForSpecies', () => {
  it('returns a hex colour for common BC tree species', () => {
    expect(colorForSpecies('FDI')).toBe(SPECIES_COLOR_MAP.FDI);
    expect(colorForSpecies('FDC')).toBe(SPECIES_COLOR_MAP.FDC);
    expect(colorForSpecies('PLI')).toBe(SPECIES_COLOR_MAP.PLI);
    expect(colorForSpecies('SX')).toBe(SPECIES_COLOR_MAP.SX);
  });

  it('matches case-insensitively', () => {
    expect(colorForSpecies('fdi')).toBe(SPECIES_COLOR_MAP.FDI);
  });

  it('falls back to the default colour for unknown species codes', () => {
    expect(colorForSpecies('XYZ')).toBe(DEFAULT_COLOR);
    expect(colorForSpecies('')).toBe(DEFAULT_COLOR);
    expect(colorForSpecies(null)).toBe(DEFAULT_COLOR);
    expect(colorForSpecies(undefined)).toBe(DEFAULT_COLOR);
  });
});
