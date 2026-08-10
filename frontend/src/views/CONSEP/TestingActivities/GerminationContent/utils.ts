import { GermCountSlotType, GermReplicateType, GermCountUpsertPayload } from '../../../../types/consep/GerminationType';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const getDefaultSeeds = (testCategoryCd?: string): number => (
  testCategoryCd === 'QA' ? 50 : 100
);

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

const REP_KEYS = ['rep1NoSeedsGerm', 'rep2NoSeedsGerm', 'rep3NoSeedsGerm', 'rep4NoSeedsGerm'] as const;

export const calcRepTotal = (
  slots: GermCountSlotType[],
  repNumber: 1 | 2 | 3 | 4
): number => slots.reduce(
  (sum, slot) => sum + (slot[REP_KEYS[repNumber - 1]] ?? 0),
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
