import { SeedlotRegFormType } from '../../../types/SeedlotRegistrationTypes';

export const InitialSeedlotFormData: SeedlotRegFormType = {
  client: {
    id: 'applicant-info-combobox',
    isInvalid: false,
    value: {
      code: '',
      label: '',
      description: ''
    }
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
    value: {
      code: '',
      label: '',
      description: ''
    }
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
