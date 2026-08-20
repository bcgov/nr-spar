import { SeedlotType } from '../../../types/SeedlotType';

export const isBClassSeedlot = (seedlot?: SeedlotType): boolean => {
  const code = seedlot?.geneticClass?.geneticClassCode;
  return code === 'B';
};

export const getPrintSeedlotLabel = (isBClass: boolean, isPending: boolean): string => {
  if (!isBClass) {
    return 'Print seedlot';
  }
  return isPending ? 'Generating report…' : 'Print seedlot (SPRR001)';
};
