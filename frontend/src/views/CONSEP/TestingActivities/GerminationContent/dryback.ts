import { DateTime } from 'luxon';

import { DrybackSavePayload, DrybackScreenType } from '../../../../types/consep/DrybackType';
import { withTime } from './utils';

/** What the Dryback modal edits. Dates are calendar dates, numbers are kept as typed. */
export type DrybackForm = {
  beginDate?: string; // 'YYYY-MM-DD'
  endDate?: string;
  dryWeight: string; // StWt400
  imbibedWeight: string;
  drybackMoist: string;
  drybackWeight: string;
  drybackTime: string;
  stratEndWeight: string;
  riaComment: string;
};

export type DrybackCalc = {
  odwt?: number;
  imbibedMoist?: number;
  drybackMoist?: number;
  targetThirtyMoist?: number;
  targetThirtyFiveMoist?: number;
};

type NumericField = 'dryWeight' | 'imbibedWeight' | 'drybackMoist' | 'drybackWeight'
  | 'drybackTime' | 'stratEndWeight';

export type DrybackErrorField = NumericField | 'beginDate' | 'endDate'
  | 'targetThirtyMoist' | 'targetThirtyFiveMoist';

// Same bounds as DrybackSaveDto (the column precisions), so a bad value is caught here, not as a 400.
const WEIGHT_MAX = 999999.999;
const NUMERIC_LIMITS: Record<NumericField, { max: number; integer?: boolean }> = {
  dryWeight: { max: WEIGHT_MAX },
  imbibedWeight: { max: WEIGHT_MAX },
  drybackMoist: { max: 99.9 },
  drybackWeight: { max: WEIGHT_MAX },
  drybackTime: { max: 999, integer: true },
  stratEndWeight: { max: WEIGHT_MAX }
};
const TARGET_MAX = 99.999;

/** Business rule: dates default to 27 days after the cold strat start. */
const DEFAULT_DAYS_AFTER_STRAT = 27;

const toText = (value?: number | null) => (value === null || value === undefined ? '' : String(value));

/** '' is no value; anything that is not a plain number is NaN. */
export const parseNumber = (raw: string): number | null => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  return /^\d*\.?\d*$/.test(trimmed) && trimmed !== '.' ? Number(trimmed) : NaN;
};

const round = (value: number | undefined, decimals: number) => (
  value === undefined ? undefined : Number(value.toFixed(decimals))
);

export const formFromData = (data: DrybackScreenType, stratStartDt?: string): DrybackForm => {
  // Only a record with no dates yet takes the default: next to a saved start date it
  // could land before it.
  const defaultDate = stratStartDt && !data.actualBeginDateTime && !data.actualEndDateTime
    ? DateTime.fromISO(stratStartDt.slice(0, 10)).plus({ days: DEFAULT_DAYS_AFTER_STRAT }).toISODate() ?? undefined
    : undefined;
  return {
    beginDate: data.actualBeginDateTime?.slice(0, 10) ?? defaultDate,
    endDate: data.actualEndDateTime?.slice(0, 10) ?? defaultDate,
    dryWeight: toText(data.dryWeight),
    imbibedWeight: toText(data.imbibedWeight),
    drybackMoist: toText(data.drybackMoist),
    drybackWeight: toText(data.drybackWeight),
    drybackTime: toText(data.drybackTime),
    stratEndWeight: toText(data.stratEndWeight),
    riaComment: data.riaComment ?? ''
  };
};

/** Moisture content of a sample weighing `weight` whose oven-dry weight is `odwt`. */
const moistureOf = (weight: number | null, odwt?: number) => (
  odwt !== undefined && weight !== null && weight > 0 ? ((weight - odwt) / weight) * 100 : undefined
);

/**
 * The spec's formulas. ODWT 400 = StWt400 * (1 - Storage MC / 100); the targets are the weights
 * at which the seed holds 30% / 35% moisture: ODWT / 0.70 and ODWT / 0.65. The spec's 35% row
 * says "/ 70", but the legacy screen's own values (16.458 -> 25.320) only work with 65.
 */
export const calculateDryback = (form: DrybackForm, storageMc?: number | null): DrybackCalc => {
  const dryWeight = parseNumber(form.dryWeight);
  const odwt = dryWeight !== null && !Number.isNaN(dryWeight) && storageMc !== null && storageMc !== undefined
    ? dryWeight * (1 - storageMc / 100)
    : undefined;
  return {
    odwt,
    imbibedMoist: moistureOf(parseNumber(form.imbibedWeight), odwt),
    drybackMoist: moistureOf(parseNumber(form.drybackWeight), odwt),
    targetThirtyMoist: odwt === undefined ? undefined : (odwt / 70) * 100,
    targetThirtyFiveMoist: odwt === undefined ? undefined : (odwt / 65) * 100
  };
};

/** Shows a calculated value with the column's decimals, or blank. */
export const formatCalc = (value: number | undefined, decimals: number) => (
  value === undefined || Number.isNaN(value) ? '' : value.toFixed(decimals)
);

const hasData = (form: DrybackForm) => !!form.endDate
  || (Object.keys(NUMERIC_LIMITS) as NumericField[]).some((field) => form[field].trim() !== '');

/** Field errors mirroring what the PUT enforces; any error blocks saving. */
export const validateDryback = (
  form: DrybackForm,
  data: DrybackScreenType,
  calc: DrybackCalc,
  today: string = DateTime.now().toISODate()!
): Partial<Record<DrybackErrorField, string>> => {
  const errors: Partial<Record<DrybackErrorField, string>> = {};
  (Object.entries(NUMERIC_LIMITS) as Array<[NumericField, { max: number; integer?: boolean }]>)
    .forEach(([field, { max, integer }]) => {
      const value = parseNumber(form[field]);
      if (value !== null && (Number.isNaN(value) || value > max || (integer && !Number.isInteger(value)))) {
        errors[field] = integer ? `Enter a whole number from 0 to ${max}` : `Enter a number from 0 to ${max}`;
      }
    });
  (['targetThirtyMoist', 'targetThirtyFiveMoist'] as const).forEach((field) => {
    if ((round(calc[field], 3) ?? 0) > TARGET_MAX) {
      errors[field] = `Cannot be more than ${TARGET_MAX} g`;
    }
  });

  if (!form.beginDate) {
    if (data.actualBeginDateTime) {
      errors.beginDate = 'A saved start date cannot be cleared';
    } else if (hasData(form)) {
      errors.beginDate = 'Start date is required when other values are entered';
    }
  } else if (form.beginDate > today) {
    errors.beginDate = 'Start date cannot be in the future';
  }
  if (form.endDate) {
    if (form.endDate > today) {
      errors.endDate = 'End date cannot be in the future';
    } else if (
      form.beginDate
      && withTime(form.endDate, data.actualEndDateTime ?? undefined)!
        < withTime(form.beginDate, data.actualBeginDateTime ?? undefined)!
    ) {
      errors.endDate = 'End date cannot be before the start date';
    }
  }
  return errors;
};

/** The full-replace PUT body. Dates keep their stored time of day when only the date changes. */
export const buildDrybackPayload = (
  form: DrybackForm,
  data: DrybackScreenType,
  calc: DrybackCalc
): DrybackSavePayload => {
  // Without a storage MC there is no ODWT to recalculate from, so the stored targets are kept.
  const canCalc = data.storageMc !== null && data.storageMc !== undefined;
  return {
    actualBeginDateTime: withTime(form.beginDate, data.actualBeginDateTime ?? undefined) ?? null,
    actualEndDateTime: withTime(form.endDate, data.actualEndDateTime ?? undefined) ?? null,
    drybackMoist: parseNumber(form.drybackMoist),
    imbibedWeight: parseNumber(form.imbibedWeight),
    drybackWeight: parseNumber(form.drybackWeight),
    dryWeight: parseNumber(form.dryWeight),
    drybackTime: parseNumber(form.drybackTime),
    targetThirtyMoist: canCalc ? round(calc.targetThirtyMoist, 3) ?? null : data.targetThirtyMoist ?? null,
    targetThirtyFiveMoist: canCalc
      ? round(calc.targetThirtyFiveMoist, 3) ?? null
      : data.targetThirtyFiveMoist ?? null,
    stratEndWeight: parseNumber(form.stratEndWeight),
    riaComment: form.riaComment || null
  };
};
