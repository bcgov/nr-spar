import { EmptyMultiOptObj } from '@/shared-constants/shared-constants';
import { SeedlotRegFormType } from '@/types/SeedlotRegistrationTypes';

export const InitialAClassSeedlotRegFormData: SeedlotRegFormType = {
  client: {
    id: 'applicant-info-input',
    isInvalid: false,
    value: ''
  },
  locationCode: {
    id: 'agency-number-input',
    isInvalid: false,
    value: ''
  },
  email: {
    id: 'applicant-email-input',
    isInvalid: false,
    value: ''
  },
  species: {
    id: 'seedlot-species-combobox',
    isInvalid: false,
    value: EmptyMultiOptObj
  },
  sourceCode: {
    id: '',
    isInvalid: false,
    value: ''
  },
  willBeRegistered: {
    id: '',
    isInvalid: false,
    value: true
  },
  isBcSource: {
    id: '',
    isInvalid: false,
    value: true
  }
};

export const InitialBClassSeedlotRegFormData: SeedlotRegFormType = {
  client: {
    id: 'b-class-applicant-info-input',
    isInvalid: false,
    value: ''
  },
  locationCode: {
    id: 'b-class-applicant-location-code-input',
    isInvalid: false,
    value: ''
  },
  email: {
    id: 'b-class-applicant-email-input',
    isInvalid: false,
    value: ''
  },
  species: {
    id: 'b-class-seedlot-species-combobox',
    isInvalid: false,
    value: EmptyMultiOptObj
  },
  sourceCode: {
    id: '',
    isInvalid: false,
    value: ''
  },
  willBeRegistered: {
    id: 'b-class-will-be-registered',
    isInvalid: false,
    value: true
  },
  isBcSource: {
    id: 'b-class-bc-source',
    isInvalid: false,
    value: true
  }
};
