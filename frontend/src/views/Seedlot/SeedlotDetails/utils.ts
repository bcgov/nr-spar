import { SeedlotType } from '../../../types/SeedlotType';
import ROUTES from '../../../routes/constants';
import { addParamToPath } from '../../../utils/PathUtils';
import { PLACE_HOLDER } from '../../../shared-constants/shared-constants';

export const isBClassSeedlot = (seedlot?: SeedlotType): boolean => {
  const code = seedlot?.geneticClass?.geneticClassCode;
  return code === 'B';
};

export const formatYesNo = (value: boolean | undefined): string => {
  if (value === undefined) {
    return PLACE_HOLDER;
  }
  return value ? 'Yes' : 'No';
};

export const getRegistrationRoute = (seedlot?: SeedlotType): string => (
  isBClassSeedlot(seedlot)
    ? ROUTES.SEEDLOT_B_CLASS_REGISTRATION
    : ROUTES.SEEDLOT_A_CLASS_REGISTRATION
);

export const getReviewRoute = (seedlot?: SeedlotType): string => (
  isBClassSeedlot(seedlot)
    ? ROUTES.SEEDLOT_B_CLASS_REVIEW
    : ROUTES.SEEDLOT_A_CLASS_REVIEW
);

export const getEditApplicantRoute = (seedlot?: SeedlotType): string => (
  isBClassSeedlot(seedlot)
    ? ROUTES.SEEDLOTS_B_CLASS_CREATION
    : ROUTES.SEEDLOT_A_CLASS_EDIT
);

export const getRegistrationPath = (
  seedlotNumber: string,
  seedlot?: SeedlotType,
  step?: number
): string => {
  const base = addParamToPath(getRegistrationRoute(seedlot), seedlotNumber);
  return step ? `${base}?step=${step}` : base;
};

export const getPrintSeedlotLabel = (isBClass: boolean, isPending: boolean): string => {
  if (!isBClass) {
    return 'Print seedlot';
  }
  return isPending ? 'Generating report…' : 'Print seedlot (SPRR001)';
};
