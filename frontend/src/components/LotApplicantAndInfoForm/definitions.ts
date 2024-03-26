import React from 'react';

import { SeedlotRegFormType } from '../../types/SeedlotRegistrationTypes';

export type ComboBoxPropsType = {
  placeholder: string;
  titleText: string;
  invalidText: string;
  helperText: string;
}

export type FormProps = {
  isSeedlot: boolean, // If it's not a seedlot then it's veglot
  isEdit: boolean,
  isReview?: boolean,
  isBClass?: boolean,
  seedlotFormData?: SeedlotRegFormType,
  setSeedlotFormData?: React.Dispatch<React.SetStateAction<SeedlotRegFormType>>
}

export type SeedlotInformationProps = {
  seedlotFormData: SeedlotRegFormType,
  setSeedlotFormData: React.Dispatch<React.SetStateAction<SeedlotRegFormType>>,
  isEdit: boolean,
  isReview?: boolean,
}
