import React from 'react';

import focusById from '../../../utils/FocusUtils';
import { SeedlotRegFormType, SeedlotRegPayloadType } from '../../../types/SeedlotRegistrationTypes';

export const convertToPayload = (formData: SeedlotRegFormType): SeedlotRegPayloadType => ({
  applicantClientNumber: formData.client.value.code,
  applicantLocationCode: formData.locationCode.value,
  applicantEmailAddress: formData.email.value,
  vegetationCode: formData.species.value.code,
  seedlotSourceCode: formData.sourceCode.value,
  toBeRegistrdInd: formData.willBeRegistered.value,
  bcSourceInd: formData.isBcSource.value,
  geneticClassCode: 'A'
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
  // Validate client
  if (seedlotFormData.client.isInvalid || !seedlotFormData.client.value.code) {
    setInputValidation('client', true, setSeedlotFormData);
    focusById(seedlotFormData.client.id);
    return isValid;
  }
  // Validate location code
  if (
    seedlotFormData.locationCode.isInvalid
    || !seedlotFormData.locationCode.value
  ) {
    setInputValidation('locationCode', true, setSeedlotFormData);
    focusById(seedlotFormData.locationCode.id);
    return isValid;
  }
  // Validate email
  if (seedlotFormData.email.isInvalid || !seedlotFormData.email.value) {
    setInputValidation('email', true, setSeedlotFormData);
    focusById(seedlotFormData.email.id);
    return isValid;
  }
  // Validate species
  if (seedlotFormData.species.isInvalid || !seedlotFormData.species.value.code) {
    setInputValidation('species', true, setSeedlotFormData);
    focusById(seedlotFormData.species.id);
    return isValid;
  }
  // Source code, and the two booleans always have a default value so there's no need to check.
  isValid = true;
  return isValid;
};
