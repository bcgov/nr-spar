import { DateTime as luxon } from 'luxon';
import { MONTH_DAY_YEAR } from '../config/DateFormat';
import { PLACE_HOLDER } from '../shared-constants/shared-constants';

export const formatDate = (date: string) => {
  if (date) {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(`${date}T00:00:00-08:00`).toLocaleDateString([], options);
  }
  return '--';
};

export const dateStringToISO = (date: string): string => {
  if (date) {
    return new Date(date).toISOString();
  }
  return '';
};

/**
 * Convert UTC timestamp to local format (MONTH_DAY_YEAR)
 */
export const utcToLocalFormat = (utcDate: string | null | undefined): string => {
  if (!utcDate) {
    return PLACE_HOLDER;
  }
  return luxon.fromISO(utcDate, { zone: 'utc' })
    .setZone('America/Vancouver').toFormat(MONTH_DAY_YEAR);
};
