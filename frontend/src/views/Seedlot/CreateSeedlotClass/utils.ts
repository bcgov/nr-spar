import React from 'react';

import { SeedlotRegFormType, SeedlotRegPayloadType } from '@/types/SeedlotRegistrationTypes';
import focusById from '../../../utils/FocusUtils';

export const convertToPayload = (
  formData: SeedlotRegFormType,
  geneticClass: 'A' | 'B'
): SeedlotRegPayloadType => ({
  applicantClientNumber: formData.client.value,
  applicantLocationCode: formData.locationCode.value,
  applicantEmailAddress: formData.email.value,
  vegetationCode: formData.species.value.code,
  seedlotSourceCode: geneticClass === 'B' ? null : formData.sourceCode.value,
  toBeRegistrdInd: formData.willBeRegistered.value,
  bcSourceInd: formData.isBcSource.value,
  geneticClassCode: geneticClass
});

export const setInputValidation = (
  inputName: keyof SeedlotRegFormType,
  isInvalid: boolean,
  setSeedlotFormData: React.Dispatch<React.SetStateAction<SeedlotRegFormType>>
) => (
  setSeedlotFormData((prevData) => ({
    ...prevData,
    [inputName]: {
      ...prevData[inputName],
      isInvalid
    }
  }))
);

export const validateRegForm = (
  seedlotFormData: SeedlotRegFormType,
  setSeedlotFormData: React.Dispatch<React.SetStateAction<SeedlotRegFormType>>
): boolean => {
  let isValid = false;
  if (seedlotFormData.client.isInvalid || !seedlotFormData.client.value) {
    setInputValidation('client', true, setSeedlotFormData);
    focusById(seedlotFormData.client.id);
    return isValid;
  }
  if (
    seedlotFormData.locationCode.isInvalid
    || !seedlotFormData.locationCode.value
  ) {
    setInputValidation('locationCode', true, setSeedlotFormData);
    focusById(seedlotFormData.locationCode.id);
    return isValid;
  }
  if (seedlotFormData.email.isInvalid || !seedlotFormData.email.value) {
    setInputValidation('email', true, setSeedlotFormData);
    focusById(seedlotFormData.email.id);
    return isValid;
  }
  if (seedlotFormData.species.isInvalid || !seedlotFormData.species.value.code) {
    setInputValidation('species', true, setSeedlotFormData);
    focusById(seedlotFormData.species.id);
    return isValid;
  }
  isValid = true;
  return isValid;
};
