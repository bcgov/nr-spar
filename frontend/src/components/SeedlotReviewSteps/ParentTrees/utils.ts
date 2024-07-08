import { PLACE_HOLDER } from '../../../shared-constants/shared-constants';

/**
 * Display a place holder if val is empty.
 */
export const formatEmptyStr = (val: string, isRead: boolean) => {
  if (!val.length && isRead) {
    return PLACE_HOLDER;
  }
  return val;
};
