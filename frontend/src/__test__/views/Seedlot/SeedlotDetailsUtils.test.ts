import { describe, expect, it } from 'vitest';
import {
  getEditApplicantRoute,
  getPrintSeedlotLabel,
  isBClassSeedlot
} from '../../../views/Seedlot/SeedlotDetails/utils';
import { SeedlotType } from '../../../types/SeedlotType';
import ROUTES from '../../../routes/constants';
import { addParamToPath } from '../../../utils/PathUtils';

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

  it('getEditApplicantRoute resolves to a parameterized edit path per class', () => {
    expect(addParamToPath(getEditApplicantRoute(seedlotWithClass('A')), '63001'))
      .toBe('/seedlots/edit-a-class-application/63001');
    expect(addParamToPath(getEditApplicantRoute(seedlotWithClass('B')), '53001'))
      .toBe('/seedlots/edit-b-class-application/53001');
    expect(getEditApplicantRoute(seedlotWithClass('B'))).not.toBe(ROUTES.SEEDLOTS_B_CLASS_CREATION);
  });
});
