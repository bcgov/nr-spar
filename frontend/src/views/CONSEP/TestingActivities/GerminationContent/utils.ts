import { DateTime } from 'luxon';
import { GermCountSlotType, GermReplicateType, GermCountUpsertPayload } from '../../../../types/consep/GerminationType';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Count dates are exchanged with the API as calendar-only ISO strings. */
const ISO_DATE = 'yyyy-MM-dd';

/** Formats accepted from the Carbon date picker's free-text input. */
const INPUT_DATE_FORMATS = ['yyyy/MM/dd', ISO_DATE, 'y/M/d', 'y-M-d'];

export const REP_COUNT_KEYS = [
  'rep1NoSeedsGerm', 'rep2NoSeedsGerm', 'rep3NoSeedsGerm', 'rep4NoSeedsGerm'
] as const;

export const getDefaultSeeds = (testCategoryCd?: string): number => (
  testCategoryCd === 'QA' ? 50 : 100
);

/**
 * Calendar date -> local Date. Built from the parts rather than parsed, so the
 * picker shows the day the user chose regardless of the browser's timezone.
 */
export const isoToJsDate = (isoDate: string): Date => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/** Local Date -> calendar date, without the UTC shift `toISOString()` applies. */
export const toLocalIsoDate = (date: Date): string => (
  DateTime.fromJSDate(date).toFormat(ISO_DATE)
);

/**
 * Parses what the user typed into the count-date field. Returns undefined for
 * anything incomplete so a half-typed date is ignored rather than treated as a
 * clear, which would wipe the column's counts.
 */
export const parseCountDateInput = (raw: string): string | undefined => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = INPUT_DATE_FORMATS
    .map((format) => DateTime.fromFormat(trimmed, format))
    .find((dateTime) => dateTime.isValid);
  return parsed?.toFormat(ISO_DATE);
};

/**
 * Splits a count date for the two-line column header, as the design has it:
 * `2024-` above `11-04`. A single line of `yyyy-MM-dd` needs roughly twice the
 * width, which across thirteen columns is most of the horizontal scroll.
 */
export const formatCountDateLines = (isoDate: string): [string, string] => {
  const [year, month, day] = isoDate.split('-');
  return [`${year}-`, `${month}-${day}`];
};

export const calcDayNumber = (
  germinatorEntry: string | undefined,
  countDt: string
): number | undefined => {
  if (!germinatorEntry || !countDt) {
    return undefined;
  }
  const entry = Date.parse(`${germinatorEntry}T00:00:00`);
  const count = Date.parse(`${countDt}T00:00:00`);
  if (Number.isNaN(entry) || Number.isNaN(count)) {
    return undefined;
  }
  return Math.round((count - entry) / MS_PER_DAY);
};

/**
 * The date day numbers are counted from. Normally the germinator entry date,
 * but records can carry day numbers without one; there the offset is
 * recoverable from any other slot that still has both a date and a day number.
 * Without it an edit would blank the day number it cannot recompute.
 */
export const resolveDayZero = (
  germinatorEntry: string | undefined,
  slots: GermCountSlotType[],
  excludeSlotIndex?: number
): string | undefined => {
  if (germinatorEntry) {
    return germinatorEntry;
  }
  const reference = slots.find((slot) => (
    slot.slotIndex !== excludeSlotIndex
    && !!slot.countDt
    && slot.dayNoOfTest !== undefined
    && slot.dayNoOfTest !== null
  ));
  if (!reference?.countDt) {
    return undefined;
  }
  const dayZero = DateTime.fromFormat(reference.countDt, ISO_DATE)
    .minus({ days: reference.dayNoOfTest as number });
  return dayZero.isValid ? dayZero.toFormat(ISO_DATE) : undefined;
};

export const validateCountDates = (
  slots: GermCountSlotType[]
): Record<string, string> => {
  const errors: Record<string, string> = {};
  const dated = slots.filter((s) => s.countDt);
  for (let i = 1; i < dated.length; i += 1) {
    const currentDt = dated[i].countDt;
    const previousDt = dated[i - 1].countDt;
    if (currentDt && previousDt && currentDt <= previousDt) {
      errors[`slot-${dated[i].slotIndex}`] = 'Count date must be after the previous count date';
    }
  }
  return errors;
};

export const calcRepTotal = (
  slots: GermCountSlotType[],
  repNumber: 1 | 2 | 3 | 4
): number => slots.reduce(
  (sum, slot) => sum + (slot[REP_COUNT_KEYS[repNumber - 1]] ?? 0),
  0
);

export const checkOverLimit = (
  slots: GermCountSlotType[],
  replicates: GermReplicateType[]
): Record<string, string> => {
  const errors: Record<string, string> = {};
  replicates.forEach((rep) => {
    // A cleared "# seeds" cell (undefined) must block autosave: the backend
    // rejects a payload missing totalNoSeeds with a @NotNull 400 that discards
    // the whole request, including valid count edits (C3). Typing stays
    // unblocked — this only gates the save.
    if (rep.totalNoSeeds === undefined) {
      errors[`rep-${rep.replicateNumber}`] = 'Number of seeds is required';
      return;
    }
    const total = calcRepTotal(slots, rep.replicateNumber as 1 | 2 | 3 | 4);
    if (total > rep.totalNoSeeds) {
      errors[`rep-${rep.replicateNumber}`] = `Total germinated (${total}) exceeds number of seeds (${rep.totalNoSeeds})`;
    }
  });
  return errors;
};

export const calcGermPct = (repTotal: number, totalSeeds?: number): number => (
  totalSeeds ? Math.round((repTotal / totalSeeds) * 100) : 0
);

export const buildUpsertPayload = (
  slots: GermCountSlotType[],
  replicates: GermReplicateType[],
  updateTimestamp?: string
): GermCountUpsertPayload => ({
  updateTimestamp,
  days: slots
    .filter((slot) => slot.countDt)
    .map(({ dailyGermSkey, cumulativeGerm, ...rest }) => rest),
  replicates
});
