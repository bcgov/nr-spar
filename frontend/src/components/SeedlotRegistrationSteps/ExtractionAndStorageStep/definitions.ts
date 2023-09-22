export type FormValidation = {
  isExtractorNameInvalid: boolean,
  isExtractorCodeInvalid: boolean,
  isExtractorStartDateInvalid: boolean,
  isExtractorEndDateInvalid: boolean,
  isStorageNameInvalid: boolean,
  isStorageCodeInvalid: boolean,
  isStorageStartDateInvalid: boolean,
  isStorageEndDateInvalid: boolean
}

export const initialValidationObj: FormValidation = {
  isExtractorNameInvalid: false,
  isExtractorCodeInvalid: false,
  isExtractorStartDateInvalid: false,
  isExtractorEndDateInvalid: false,
  isStorageNameInvalid: false,
  isStorageCodeInvalid: false,
  isStorageStartDateInvalid: false,
  isStorageEndDateInvalid: false
};

export type ValidateLocationType = {
  [key: string]: {
    forestClientNumber: string,
    invalidLocationMessage: string,
    locationCodeHelper: string
  }
};
