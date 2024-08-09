import { DateTime as luxon } from 'luxon';
import { PLACE_HOLDER } from '../shared-constants/shared-constants';
import { MONTH_DAY_YEAR, UTC_YEAR_MONTH_DAY } from '../config/DateFormat';

const DEFAULT_LOCAL_TIMEZONE = 'America/Vancouver';

export const formatDate = (date: string) => {
  if (date) {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(`${date}T00:00:00-08:00`).toLocaleDateString([], options);
  }
  return '--';
};

/**
 * Convert UTC timestamp to local format (MONTH_DAY_YEAR)
 */
export const utcToLocalFormat = (utcDate: string | null | undefined): string => {
  if (!utcDate) {
    return PLACE_HOLDER;
  }
  return luxon.fromISO(utcDate, { zone: 'utc' })
    .setZone(DEFAULT_LOCAL_TIMEZONE).toFormat(MONTH_DAY_YEAR);
};

/**
 * Convert local date to UTC date.
 */
export const localDateToUtcFormat = (localDate: string): string | null => {
  if (!localDate) {
    return null;
  }
  return luxon.fromFormat(localDate, 'yyyy/MM/dd', { zone: 'America/Vancouver' })
    .toUTC().toFormat(UTC_YEAR_MONTH_DAY);
};
