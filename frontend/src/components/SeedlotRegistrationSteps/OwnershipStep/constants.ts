import { EmptyMultiOptObj } from '../../../shared-constants/shared-constants';
import AgencyTextPropsType from '../../../types/AgencyTextPropsType';
import { SingleOwnerFormSubmitType } from '../../../types/SeedlotType';
import { SingleOwnerForm } from './definitions';

export const DEFAULT_INDEX = 0;

export const MAX_OWNERS = 100;

export const agencyFieldsProps: AgencyTextPropsType = {
  useDefaultCheckbox: {
    name: 'useDefaultOwner',
    labelText: 'Use applicant agency as owner agency'
  },
  agencyInput: {
    titleText: 'Owner agency acronym',
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
    invalidText: 'The sum of all owner portions must add up to 100'
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

export const createOwnerTemplate = (
  newId: number,
  ownerData: SingleOwnerFormSubmitType
): SingleOwnerForm => ({
  id: newId,
  useDefaultAgencyInfo: {
    id: 'ownership-use-default-agency',
    value: newId === DEFAULT_INDEX,
    isInvalid: false
  },
  ownerAgency: {
    id: `ownership-agency-${newId}`,
    value: EmptyMultiOptObj,
    isInvalid: false
  },
  ownerCode: {
    id: `ownership-location-code-${newId}`,
    value: ownerData.ownerLocnCode,
    isInvalid: false
  },
  ownerPortion: {
    id: `ownership-portion-${newId}`,
    value: String(ownerData.originalPctOwned),
    isInvalid: false
  },
  reservedPerc: {
    id: `ownership-reserved-${newId}`,
    value: String(ownerData.originalPctRsrvd),
    isInvalid: false
  },
  surplusPerc: {
    id: `ownership-surplus-${newId}`,
    value: String(ownerData.originalPctSrpls),
    isInvalid: false
  },
  fundingSource: {
    id: `ownership-funding-source-${newId}`,
    value: EmptyMultiOptObj,
    isInvalid: false
  },
  methodOfPayment: {
    id: `ownership-method-payment-${newId}`,
    value: EmptyMultiOptObj,
    isInvalid: false,
    hasChanged: false
  }
});
