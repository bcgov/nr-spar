import { emptyMultiOptObj } from '../../../shared-constants/shared-constants';
import AgencyTextPropsType from '../../../types/AgencyTextPropsType';
import { FormInvalidationObj } from '../../../views/Seedlot/SeedlotRegistrationForm/definitions';
import { SingleOwnerForm } from './definitions';

export const DEFAULT_INDEX = 0;

export const MAX_OWNERS = 100;

export const agencyFieldsProps: AgencyTextPropsType = {
  useDefaultCheckbox: {
    name: 'useDefaultOwner',
    labelText: 'Use applicant agency as owner agency'
  },
  agencyInput: {
    name: 'ownerAgency',
    labelText: 'Owner agency',
    invalidText: 'Please choose a valid owner agency, filter with agency number, name or acronym'
  },
  locationCode: {
    name: 'ownerLocationCode',
    labelText: 'Owner location code'
  }
};

export const inputText = {
  portion: {
    label: 'Owner portion (%)',
    invalidText: 'The sum of all owner portions should add up to 100'
  },
  reserved: {
    label: 'Reserved (%)'
  },
  surplus: {
    label: 'Surplus (%)'
  },
  funding: {
    placeholder: 'Choose a funding source option',
    titleText: 'Funding source',
    invalidText: 'Please choose a valid funding source option'
  },
  payment: {
    placeholder: 'Choose a method of payment',
    titleText: 'Method of payment',
    invalidText: 'Please choose a valid method of payment'
  },
  greaterThan: 'Value must be lower or equal to 100',
  lowerThan: 'Value must be higher or equal to 0',
  twoDecimal: 'Value can have up to 2 decimal places'
};

export const createOwnerTemplate = (newId: number): SingleOwnerForm => ({
  id: newId,
  useDefaultAgencyInfo: {
    id: 'ownership-use-default-agency',
    value: true,
    isInvalid: false
  },
  ownerAgency: {
    id: `ownership-agency-${newId}`,
    value: '',
    isInvalid: false
  },
  ownerCode: {
    id: `ownership-location-code-${newId}`,
    value: '',
    isInvalid: false
  },
  ownerPortion: {
    id: `ownership-portion-${newId}`,
    value: '0.00',
    isInvalid: false
  },
  reservedPerc: {
    id: `ownership-reserved-${newId}`,
    value: '100.00',
    isInvalid: false
  },
  surplusPerc: {
    id: `ownership-surplus-${newId}`,
    value: '0.00',
    isInvalid: false
  },
  fundingSource: {
    id: `ownership-funding-source-${newId}`,
    value: emptyMultiOptObj,
    isInvalid: false
  },
  methodOfPayment: {
    id: `ownership-method-payment-${newId}`,
    value: emptyMultiOptObj,
    isInvalid: false
  }
});

export const validTemplate: FormInvalidationObj = {
  owner: {
    isInvalid: false,
    invalidText: agencyFieldsProps.agencyInput.invalidText
  },
  code: {
    isInvalid: false,
    invalidText: ''
  },
  portion: {
    isInvalid: false,
    invalidText: inputText.portion.invalidText
  },
  reserved: {
    isInvalid: false,
    invalidText: ''
  },
  surplus: {
    isInvalid: false,
    invalidText: ''
  },
  funding: {
    isInvalid: false,
    invalidText: inputText.funding.invalidText
  },
  payment: {
    isInvalid: false,
    invalidText: inputText.payment.invalidText
  }
};
