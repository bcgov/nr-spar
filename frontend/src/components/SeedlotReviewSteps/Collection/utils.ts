import validator from 'validator';

import { PLACE_HOLDER } from '../../../shared-constants/shared-constants';
import { CodeDescResType } from '../../../types/CodeDescResType';
import { StringInputType } from '../../../types/FormInputType';
import { isFloatWithinRange } from '../../../utils/NumberUtils';

import {
  INVALID_NE_DECIMAL_MSG, INVALID_NE_RANGE_MSG, MAX_NE, MAX_NE_DECIMAL, MIN_NE
} from './constants';

/**
 * Format collection codes into human friendly words, e.g. [4, 5] -> "raking, picking".
 */
export const formatCollectionMethods = (
  codes: string[],
  methods: CodeDescResType[] | undefined
): string => {
  let formated = '';

  if (!methods) {
    return formated;
  }

  codes.forEach((code) => {
    const found = methods.find((method) => method.code === code);

    if (found) {
      formated += `${found.description}, `;
    }
  });

  return formated.substring(0, formated.length - 2);
};

/**
 * Display a place holder if val is empty.
 */
export const formatEmptyStr = (val: string, isRead: boolean) => {
  if (!val.length && isRead) {
    return PLACE_HOLDER;
  }
  return val;
};

/**
 * Validate whether the NE value has the correct number of decimal place and is within range.
 */
export const validateEffectivePopSize = (inputObj: StringInputType): StringInputType => {
  const validatedObj = inputObj;

  const isOverDecimal = !validator.isDecimal(validatedObj.value, { decimal_digits: `0,${MAX_NE_DECIMAL}` });
  validatedObj.isInvalid = isOverDecimal;

  if (isOverDecimal) {
    validatedObj.errMsg = INVALID_NE_DECIMAL_MSG;
    return validatedObj;
  }

  const isOutOfRange = !isFloatWithinRange(validatedObj.value, MIN_NE, MAX_NE);

  validatedObj.isInvalid = isOutOfRange;

  if (isOutOfRange) {
    validatedObj.errMsg = INVALID_NE_RANGE_MSG;
    return validatedObj;
  }

  validatedObj.errMsg = undefined;

  return validatedObj;
};
