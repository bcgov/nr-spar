import { PLACE_HOLDER } from '../../../shared-constants/shared-constants';
import { CodeDescResType } from '../../../types/CodeDescResType';

/**
 * Format collection codes into human friendly words, e.g. [4, 5] -> "raking, picking".
 */
export const formatCollectionMethods = (
  codes: string[],
  methods: CodeDescResType[] | undefined
): string => {
  let formatted = '';

  if (!methods) {
    return formatted;
  }

  codes.forEach((code) => {
    const found = methods.find((method) => method.code === code);

    if (found) {
      formatted += `${found.description}, `;
    }
  });

  return formatted.substring(0, formatted.length - 2);
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
