import { PLACE_HOLDER } from '../../../../../shared-constants/shared-constants';

export const formatDmsWithHemisphere = (
  degree: number | null | undefined,
  minute: number | null | undefined,
  second: number | null | undefined,
  hemisphere: string | null | undefined
): string => {
  if (degree == null || minute == null || second == null) {
    return PLACE_HOLDER;
  }
  const hemi = hemisphere ? ` ${hemisphere}` : '';
  return `${degree}° ${minute}' ${second}"${hemi}`;
};

export const formatBecZone = (
  zoneCode: string | null | undefined,
  zoneDescription: string | null | undefined
): string => {
  if (!zoneCode) {
    return PLACE_HOLDER;
  }
  if (zoneDescription) {
    return `${zoneCode} - ${zoneDescription}`;
  }
  return zoneCode;
};

export const formatOptionalNumber = (value: number | null | undefined): string => (
  value != null ? String(value) : PLACE_HOLDER
);

export const formatYesNo = (value: boolean | undefined): string => {
  if (value === undefined) {
    return PLACE_HOLDER;
  }
  return value ? 'Yes' : 'No';
};

export const formatOptionalString = (value: string | null | undefined): string => (
  value && value.length > 0 ? value : PLACE_HOLDER
);
