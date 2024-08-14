import { DateTime as luxon } from 'luxon';
import { PLACE_HOLDER } from '../shared-constants/shared-constants';
import { MONTH_DAY_YEAR, ISO_YEAR_MONTH_DAY_DASH, ISO_YEAR_MONTH_DAY_SLASH } from '../config/DateFormat';

const DEFAULT_LOCAL_TIMEZONE = 'America/Vancouver';

export const formatDate = (date: string) => {
  if (date) {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(`${date}T00:00:00-08:00`).toLocaleDateString([], options);
  }
  return '--';
};

/**
 * Convert UTC timestamp to Associated Press Style (e.g. Oct 26, 2023)
 */
export const utcToApStyle = (utcDate: string | null | undefined): string => {
  if (!utcDate) {
    return PLACE_HOLDER;
  }
  return luxon.fromISO(utcDate, { zone: 'utc' })
    .setZone(DEFAULT_LOCAL_TIMEZONE).toFormat(MONTH_DAY_YEAR);
};

/**
 * Convert UTC timestamp to ISO 8601 style with slashes (e.g. 2023/10/26)
 */
export const utcToIsoSlashStyle = (utcDate: string | null | undefined): string => {
  if (!utcDate) {
    return '';
  }
  return luxon.fromISO(utcDate, { zone: 'utc' })
    .setZone(DEFAULT_LOCAL_TIMEZONE).toFormat(ISO_YEAR_MONTH_DAY_SLASH);
};

/**
 * Convert local date to UTC date.
 */
export const localDateToUtcFormat = (localDate: string): string | null => {
  if (!localDate) {
    return null;
  }
  return luxon.fromFormat(localDate, 'yyyy/MM/dd', { zone: 'America/Vancouver' })
    .toUTC().toFormat(ISO_YEAR_MONTH_DAY_DASH);
};
