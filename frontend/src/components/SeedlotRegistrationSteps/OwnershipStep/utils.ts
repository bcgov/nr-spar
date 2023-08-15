import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { OwnershipInvalidObj } from '../../../views/Seedlot/SeedlotRegistrationForm/definitions';
import { inputText, ownerTemplate, validTemplate } from './constants';

import {
  SingleOwnerForm,
  SingleInvalidObj
} from './definitions';

const twoDigitRegex = /^\d{2}$/;

const getNextId = (currentArray: Array<SingleOwnerForm>): number => {
  let max = -1;
  currentArray.forEach((obj) => {
    if (obj.id > max) {
      max = obj.id;
    }
  });
  return max + 1;
};

export const insertOwnerForm = (
  ownershiptArray: Array<SingleOwnerForm>,
  validationObj: OwnershipInvalidObj,
  methodsOfPayment: MultiOptionsObj[]
) => {
  const newOwnerForm = structuredClone(ownerTemplate);
  const newValidForm = { ...validTemplate };
  const newId = getNextId(ownershiptArray);
  newOwnerForm.id = newId;
  const defaultPayment = methodsOfPayment.filter((method) => method.isDefault)[0] ?? null;
  newOwnerForm.methodOfPayment = defaultPayment;

  return {
    newOwnerArr: [...ownershiptArray, newOwnerForm],
    newValidObj: {
      ...validationObj,
      [newId]: newValidForm
    }
  };
};

export const deleteOwnerForm = (
  id: number,
  ownershiptArray: Array<SingleOwnerForm>,
  validationObj: OwnershipInvalidObj
) => {
  if (id === 0) {
    return {
      newOwnerArr: ownershiptArray,
      newValidObj: validationObj
    };
  }
  const newOwnerArray = ownershiptArray.filter((obj) => obj.id !== id);
  const newValidObj = { ...validationObj };
  delete newValidObj[id];
  return {
    newOwnerArr: newOwnerArray,
    newValidObj
  };
};

// Assume the fullString is in the form of '0032 - Strong Seeds Orchard - SSO'
// Returns the middle string, e.g. 'Strong Seeds Orchard'
export const getAgencyName = (fullString: string | null): string => {
  if (fullString === null || !fullString.includes('-')) {
    return 'Owner agency name';
  }
  const splitArr = fullString.split(' - ');
  if (splitArr.length === 3) {
    return splitArr[1];
  }
  return '';
};

export const formatPortionPerc = (value: string): string => {
  if (value === null || value === '' || Number(value) === 0) {
    return '--';
  }
  // If the value is an integer return the whole number
  if (Number(value) % 1 === 0) {
    return Number(value).toFixed(0);
  }
  return value;
};

const isDecimalValid = (value: string): boolean => {
  if (value.includes('.')) {
    if (value.split('.')[1].length > 2) {
      return false;
    }
  }
  return true;
};

const validatePerc = (value: string): SingleInvalidObj => {
  let invalidText = inputText.twoDecimal;
  let isInvalid = !isDecimalValid(value);
  if (!isInvalid) {
    if (Number(value) > 100) {
      isInvalid = true;
      invalidText = inputText.greaterThan;
    }
    if (Number(value) < 0) {
      isInvalid = true;
      invalidText = inputText.lowerThan;
    }
  }
  return { isInvalid, invalidText };
};

export const getValidKey = (name: string): string => {
  if (name === 'ownerAgency') return 'owner';
  if (name === 'ownerCode') return 'code';
  if (name === 'ownerPortion') return 'portion';
  if (name === 'reservedPerc') return 'reserved';
  if (name === 'surplusPerc') return 'surplus';
  if (name === 'fundingSource') return 'funding';
  if (name === 'methodOfPayment') return 'payment';
  throw new Error('Failed to get valid key');
};

// The sum of reserved and surplus should be 100, if one is changed, auto calc the other one
export const calcResvOrSurp = (
  index: number,
  field: string,
  value: string,
  currentArray: Array<SingleOwnerForm>
) => {
  const theOtherName = field === 'reservedPerc' ? 'surplusPerc' : 'reservedPerc';
  let theOtherValue = String((100 - Number(value)).toFixed(2));
  // If the other value is an int then show a whole number
  if (Number(theOtherValue) % 1 === 0) {
    theOtherValue = Number(theOtherValue).toFixed(0);
  }
  const newArr = [...currentArray];
  newArr[index] = {
    ...newArr[index],
    [theOtherName]: theOtherValue
  };
  // Validate the other value after recalculation
  const { isInvalid, invalidText } = validatePerc(theOtherValue);
  const validKey = getValidKey(theOtherName);
  return {
    newArr,
    isInvalid,
    invalidText,
    validKey
  };
};

export const skipForInvalidLength = (name: string, value: string): boolean => {
  if (name === 'ownerCode' && value.length > 2) {
    return true;
  }
  return false;
};

const isInputEmpty = (value: string | number | MultiOptionsObj | null) => !value;

export const isInputInvalid = (name: string, value: string): SingleInvalidObj => {
  let isInvalid = false;
  let invalidText = '';
  switch (name) {
    case 'ownerAgency':
      isInvalid = isInputEmpty(value);
      invalidText = inputText.owner.invalidText;
      return {
        isInvalid,
        invalidText
      };
    case 'ownerCode':
      isInvalid = !twoDigitRegex.test(value);
      invalidText = inputText.code.invalidText;
      return {
        isInvalid,
        invalidText
      };
    case 'ownerPortion':
      return validatePerc(value);
    case 'reservedPerc':
      return validatePerc(value);
    case 'surplusPerc':
      return validatePerc(value);
    case 'fundingSource':
      isInvalid = isInputEmpty(value);
      invalidText = inputText.funding.invalidText;
      return {
        isInvalid,
        invalidText
      };
    case 'methodOfPayment':
      isInvalid = isInputEmpty(value);
      invalidText = inputText.payment.invalidText;
      return {
        isInvalid,
        invalidText
      };
    default:
      return {
        isInvalid: false,
        invalidText: ''
      };
  }
};

export const arePortionsValid = (ownershiptArray: Array<SingleOwnerForm>): boolean => {
  let sum = 0;
  ownershiptArray.forEach((obj) => {
    sum += Number(obj.ownerPortion);
  });
  return Number(sum.toFixed(2)) === 100;
};

export type AllValidObj = {
  allValid: boolean,
  invalidId: number,
  invalidField: string,
  invalidValue: string,
  ownerOk: boolean
}
