import { inputText, ownerTemplate, validTemplate } from './constants';

import {
  SingleOwnerForm,
  ValidationProp,
  SingleInvalidObj,
  ValidationPropNoId
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
  validationArray: Array<ValidationProp>,
  defaultPayment: string
) => {
  const newOwnerForm = { ...ownerTemplate };
  const newValidForm = { ...validTemplate };
  const newId = getNextId(ownershiptArray);
  newOwnerForm.id = newId;
  newOwnerForm.methodOfPayment = defaultPayment;
  newValidForm.id = newId;
  return {
    newOwnerArr: [...ownershiptArray, newOwnerForm],
    newValidArr: [...validationArray, newValidForm],
    newId
  };
};

export const deleteOwnerForm = (
  id: number,
  ownershiptArray: Array<SingleOwnerForm>,
  validationArray: Array<ValidationProp>
) => {
  if (id === 0) {
    return {
      newOwnerArr: ownershiptArray,
      newValidArr: validationArray
    };
  }
  const newOwnerArray = ownershiptArray.filter((obj) => obj.id !== id);
  const newValidArray = validationArray.filter((obj) => obj.id !== id);
  return {
    newOwnerArr: newOwnerArray,
    newValidArr: newValidArray
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

const getOwnerKey = (name: string): string => {
  if (name === 'owner') return 'ownerAgency';
  if (name === 'code') return 'ownerCode';
  if (name === 'portion') return 'ownerPortion';
  if (name === 'reserved') return 'reservedPerc';
  if (name === 'surplus') return 'surplusPerc';
  if (name === 'funding') return 'fundingSource';
  if (name === 'payment') return 'methodOfPayment';
  throw new Error('Failed to get owner key');
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

const isInputEmpty = (value: string | number | null) => {
  // null can be the value even with the type check
  if (value === '' || value === null) {
    return true;
  }
  return false;
};

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
  return sum === 100;
};

export type AllValidObj = {
  allValid: boolean,
  invalidId: number,
  invalidField: string,
  invalidValue: string,
  ownerOk: boolean
}

const isOwnerObjInvalid = (ownerObj: SingleOwnerForm) => {
  const keys = Object.keys(ownerObj);
  const len = keys.length;
  for (let i = 0; i < len; i += 1) {
    const key = keys[i];
    if (key !== 'id') {
      const val = ownerObj[key as keyof SingleOwnerForm];
      if (isInputEmpty(val)) {
        return {
          isInvalid: true,
          invalidKey: key,
          invalidValue: val
        };
      }
    }
  }
  return {
    isInvalid: false,
    invalidKey: '',
    invalidValue: ''
  };
};

const isValidObjInvalid = (invalidObj: ValidationProp) => {
  const keys = Object.keys(invalidObj);
  const len = keys.length;
  for (let i = 0; i < len; i += 1) {
    const key = keys[i];
    if (key !== 'id') {
      if (invalidObj[key as keyof ValidationPropNoId].isInvalid) {
        return {
          isValidValInvalid: true,
          invalidValidKey: key
        };
      }
    }
  }
  return {
    isValidValInvalid: false,
    invalidValidKey: ''
  };
};

export const getInvalidIdAndKey = (
  ownershiptArray: Array<SingleOwnerForm>,
  validationArray: Array<ValidationProp>
): AllValidObj => {
  const ownerLen = ownershiptArray.length;

  for (let i = 0; i < ownerLen; i += 1) {
    const ownerObj = ownershiptArray[i];
    const validObj = validationArray[i];
    if (ownerObj.id !== validObj.id) {
      throw new Error('Validate all inputs error, id mismatch.');
    }
    const { isInvalid, invalidKey, invalidValue } = isOwnerObjInvalid(ownerObj);
    if (isInvalid) {
      return {
        allValid: false,
        invalidId: validObj.id,
        invalidField: invalidKey,
        invalidValue: String(invalidValue),
        ownerOk: false
      };
    }

    const { isValidValInvalid, invalidValidKey } = isValidObjInvalid(validObj);
    if (isValidValInvalid) {
      return {
        allValid: false,
        invalidId: validObj.id,
        invalidField: getOwnerKey(invalidValidKey),
        invalidValue: String(invalidValue),
        ownerOk: true
      };
    }
  }

  return {
    allValid: true,
    invalidId: -1,
    invalidField: '',
    invalidValue: '',
    ownerOk: true
  };
};
