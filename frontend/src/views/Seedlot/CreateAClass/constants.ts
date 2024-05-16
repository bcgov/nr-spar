import { EmptyMultiOptObj } from '../../../shared-constants/shared-constants';
import { SeedlotRegFormType } from '../../../types/SeedlotRegistrationTypes';

export const InitialSeedlotFormData: SeedlotRegFormType = {
  client: {
    id: 'applicant-info-input',
    isInvalid: false,
    value: EmptyMultiOptObj
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
