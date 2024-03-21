import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { emptyOwnershipStep } from '../../../views/Seedlot/SeedlotRegFormClassA/constants';
import { inputText, createOwnerTemplate } from './constants';

import {
  SingleOwnerForm,
  SingleInvalidObj
} from './definitions';

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
  ownershipArray: Array<SingleOwnerForm>,
  methodsOfPayment: MultiOptionsObj[]
) => {
  const clonedArray = structuredClone(ownershipArray);
  const newId = getNextId(ownershipArray);
  const newOwnerForm = createOwnerTemplate(newId, emptyOwnershipStep[0]);

  const defaultPayment = methodsOfPayment.filter((method) => method.isDefault)[0] ?? null;
  newOwnerForm.methodOfPayment.value = defaultPayment;

  clonedArray.push(newOwnerForm);

  return clonedArray;
};

export const deleteOwnerForm = (
  id: number,
  ownershiptArray: Array<SingleOwnerForm>
) => {
  if (id === 0) {
    return {
      newOwnerArr: ownershiptArray
    };
  }
  const newOwnerArray = ownershiptArray.filter((obj) => obj.id !== id);
  return {
    newOwnerArr: newOwnerArray
  };
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

export const validatePerc = (value: string): SingleInvalidObj => {
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

export const arePortionsValid = (ownershipArray: Array<SingleOwnerForm>): boolean => {
  let sum = 0;
  ownershipArray.forEach((obj) => {
    sum += Number(obj.ownerPortion.value);
  });
  return Number(sum.toFixed(2)) === 100;
};
