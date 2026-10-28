import { describe, expect, it } from 'vitest';
import { getPrintSeedlotLabel, isBClassSeedlot } from '../../../views/Seedlot/SeedlotDetails/utils';
import { SeedlotType } from '../../../types/SeedlotType';

const seedlotWithClass = (geneticClassCode: string): SeedlotType => ({
  geneticClass: { geneticClassCode }
} as SeedlotType);

describe('SeedlotDetails print helpers', () => {
  it('isBClassSeedlot is true only for genetic class B', () => {
    expect(isBClassSeedlot(undefined)).toBe(false);
    expect(isBClassSeedlot(seedlotWithClass('A'))).toBe(false);
    expect(isBClassSeedlot(seedlotWithClass('B'))).toBe(true);
  });

  it('getPrintSeedlotLabel reflects class and pending state', () => {
    expect(getPrintSeedlotLabel(false, false)).toBe('Print seedlot');
    expect(getPrintSeedlotLabel(false, true)).toBe('Print seedlot');
    expect(getPrintSeedlotLabel(true, false)).toBe('Print seedlot (SPRR001)');
    expect(getPrintSeedlotLabel(true, true)).toBe('Generating report…');
  });
});
