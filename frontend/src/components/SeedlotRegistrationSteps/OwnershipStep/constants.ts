import { FormInvalidationObj } from '../../../views/Seedlot/SeedlotRegistrationForm/definitions';
import { SingleOwnerForm } from './definitions';

export const DEFAULT_INDEX = 0;

export const DEFAULT_PAYMENT_INDEX = 0;

export const MAX_OWNERS = 100;

export const inputText = {
  checkbox: {
    labelText: 'Use applicant agency as owner agency'
  },
  owner: {
    placeholder: 'Enter or choose your agency',
    titleText: 'Owner agency',
    helperText: 'You can enter the agency number, name or acronym',
    invalidText: 'Please choose a valid owner agency, filter with agency number, name or acronym'
  },
  code: {
    placeholder: 'Example: 00',
    labelText: 'Owner location code',
    helperText: '2-digit code that identifies the address of operated office or division',
    invalidText: 'Please enter a valid 2-digit code that identifies the address of operated office or division'
  },
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

export const ownerTemplate: SingleOwnerForm = {
  id: -1,
  useDefaultAgencyInfo: true,
  ownerAgency: '',
  ownerCode: '',
  ownerPortion: '0.00',
  reservedPerc: '100.00',
  surplusPerc: '0.00',
  fundingSource: {
    label: '',
    code: '',
    description: ''
  },
  methodOfPayment: {
    label: 'ITC - Invoice to Client Address',
    code: 'ITC',
    description: 'Invoice to Client Address'
  }
};

export const validTemplate: FormInvalidationObj = {
  owner: {
    isInvalid: false,
    invalidText: inputText.owner.invalidText
  },
  code: {
    isInvalid: false,
    invalidText: inputText.code.invalidText
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
