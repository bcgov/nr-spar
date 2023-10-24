import { SeedlotRegFormType } from '../../types/SeedlotRegistrationTypes';
import ComboBoxPropsType from './definitions';

export const pageTexts = {
  locCodeInput: {
    helperTextDisabled: 'Please select an Applicant Agency before setting the agency number',
    helperTextEnabled: '2-digit code that identifies the address of operated office or division',
    invalidLocationValue: 'Please enter a valid value between 0 and 99',
    invalidLocationForSelectedAgency: 'This agency number is not valid for the selected agency, please enter a valid one or change the agency'
  }
};

export const applicantAgencyFieldConfig: ComboBoxPropsType = {
  placeholder: 'Select an agency...',
  titleText: 'Applicant agency name',
  invalidText: '',
  helperText: 'You can enter your agency number, name or acronym'
};

export const speciesFieldConfig: ComboBoxPropsType = {
  placeholder: 'Enter or choose an species for the seedlot',
  titleText: 'Seedlot species',
  invalidText: 'Please select a species',
  helperText: ''
};

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
    id: 'appliccant-email-input',
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
    value: 'tested'
  },
  willBeRegistered: true,
  isBcSource: true
};
