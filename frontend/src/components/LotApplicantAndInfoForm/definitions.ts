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
  isEdit: boolean
  isBClass?: boolean,
}

export type SeedlotInformationProps = {
  formData: SeedlotRegFormType,
  setFormData: React.Dispatch<React.SetStateAction<SeedlotRegFormType>>
}
