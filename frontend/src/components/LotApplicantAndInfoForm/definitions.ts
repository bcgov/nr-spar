import React from 'react';
import { UseMutateFunction } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { SeedlotRegFormType, SeedlotRegPayloadType } from '../../types/SeedlotRegistrationTypes';

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
  seedlotFormData: SeedlotRegFormType,
  setSeedlotFormData: React.Dispatch<React.SetStateAction<SeedlotRegFormType>>,
  isEdit: boolean,
  seedlotMutationFunc: UseMutateFunction<
    AxiosResponse<any, any>,
    AxiosError<unknown, any>,
    SeedlotRegPayloadType, unknown
  >
}
