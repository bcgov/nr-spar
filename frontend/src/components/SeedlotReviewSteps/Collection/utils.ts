import { PLACE_HOLDER } from '../../../shared-constants/shared-constants';
import { CodeDescResType } from '../../../types/CodeDescResType';

/**
 * Format collection codes into human friendly words, e.g. [4, 5] -> "raking, picking".
 */
export const formatCollectionMethods = (codes: string[], methods: CodeDescResType[]): string => {
  let formated = '';

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
