/* eslint-disable no-undef */
import { describe, it, expect } from 'vitest';
import {
  getDefaultSeeds, calcDayNumber, resolveDayZero, validateCountDates, formatCountDateLines,
  calcRepTotal, checkOverLimit, calcGermPct, buildUpsertPayload, parseCountInput,
  getSlotDateBounds
} from '../../../views/CONSEP/TestingActivities/GerminationContent/utils';

describe('getDefaultSeeds', () => {
  it('returns 50 for QA and 100 otherwise', () => {
    expect(getDefaultSeeds('QA')).toBe(50);
    expect(getDefaultSeeds('STD')).toBe(100);
    expect(getDefaultSeeds(undefined)).toBe(100);
  });
});

describe('formatCountDateLines', () => {
  // The column is sized to the widest of these two lines, not the whole date.
  it('splits a count date into year and month-day lines', () => {
    expect(formatCountDateLines('2024-11-04')).toEqual(['2024-', '11-04']);
  });
});

describe('calcDayNumber', () => {
  // Ticket AC1: into germinator 2024-10-31, first count 2024-11-04 -> day 4
  it('counts whole days from germinator entry', () => {
    expect(calcDayNumber('2024-10-31', '2024-11-04')).toBe(4);
  });
  it('returns undefined without a germinator entry date', () => {
    expect(calcDayNumber(undefined, '2024-11-04')).toBeUndefined();
  });
});

describe('resolveDayZero', () => {
  const slots = [
    { slotIndex: 1, countDt: '2026-03-09', dayNoOfTest: 3 },
    { slotIndex: 2, countDt: '2026-03-11', dayNoOfTest: 5 }
  ];

  it('prefers the germinator entry date', () => {
    expect(resolveDayZero('2026-03-01', slots)).toBe('2026-03-01');
  });

  // Records can carry day numbers with no germinator entry date; without this
  // fallback, editing one column blanks a day number nothing can recompute.
  it('backs out day zero from another dated slot', () => {
    expect(resolveDayZero(undefined, slots)).toBe('2026-03-06');
  });

  it('ignores the slot being edited', () => {
    expect(resolveDayZero(undefined, slots, 1)).toBe('2026-03-06');
    expect(resolveDayZero(undefined, [slots[0]], 1)).toBeUndefined();
  });

  it('returns undefined when nothing carries both a date and a day number', () => {
    expect(resolveDayZero(undefined, [{ slotIndex: 1, countDt: '2026-03-09' }])).toBeUndefined();
    expect(resolveDayZero(undefined, [])).toBeUndefined();
  });
});

describe('validateCountDates', () => {
  it('flags a count date not after the previous one', () => {
    const slots = [
      { slotIndex: 1, countDt: '2024-11-04' },
      { slotIndex: 2, countDt: '2024-11-04' }
    ];
    const errors = validateCountDates(slots as any);
    expect(errors['slot-2']).toBe('Count date must be after the previous count date');
    expect(errors['slot-1']).toBeUndefined();
  });
});

describe('rep totals and over-limit', () => {
  const slots = [
    { slotIndex: 1, countDt: '2024-11-04', rep1NoSeedsGerm: 60, rep2NoSeedsGerm: 10 },
    { slotIndex: 2, countDt: '2024-11-05', rep1NoSeedsGerm: 50, rep2NoSeedsGerm: 20 }
  ] as any;

  it('sums one replicate across slots', () => {
    expect(calcRepTotal(slots, 1)).toBe(110);
    expect(calcRepTotal(slots, 2)).toBe(30);
  });

  it('flags replicates whose total exceeds their seeds', () => {
    const reps = [
      { replicateNumber: 1, totalNoSeeds: 100 },
      { replicateNumber: 2, totalNoSeeds: 100 }
    ] as any;
    const errors = checkOverLimit(slots, reps);
    expect(errors['rep-1']).toBe('Total germinated (110) exceeds number of seeds (100)');
    expect(errors['rep-2']).toBeUndefined();
  });

  // C3: a cleared "# seeds" cell leaves totalNoSeeds undefined. The backend
  // rejects the whole payload with a @NotNull 400, so autosave must be blocked
  // client-side with a rep-scoped error.
  it('flags a replicate whose number of seeds is missing', () => {
    const reps = [
      { replicateNumber: 1, totalNoSeeds: undefined },
      { replicateNumber: 2, totalNoSeeds: 100 }
    ] as any;
    const errors = checkOverLimit(slots, reps);
    expect(errors['rep-1']).toBe('Number of seeds is required');
    expect(errors['rep-2']).toBeUndefined();
  });
});

describe('calcGermPct', () => {
  it('rounds the percentage and handles missing seeds', () => {
    expect(calcGermPct(45, 100)).toBe(45);
    expect(calcGermPct(45, undefined)).toBe(0);
  });
});

describe('buildUpsertPayload', () => {
  it('keeps only dated slots and strips derived fields', () => {
    const slots = [
      {
        slotIndex: 1, countDt: '2024-11-04', dayNoOfTest: 4, rep1NoSeedsGerm: 5,
        dailyGermSkey: 99, cumulativeGerm: 1.5
      },
      { slotIndex: 2 }
    ] as any;
    const reps = [{ replicateNumber: 1, totalNoSeeds: 100 }] as any;
    const payload = buildUpsertPayload(slots, reps, '2026-01-01T00:00:00');
    expect(payload.days).toHaveLength(1);
    expect(payload.days[0]).not.toHaveProperty('dailyGermSkey');
    expect(payload.days[0].slotIndex).toBe(1);
    expect(payload.replicates).toHaveLength(1);
    expect(payload.updateTimestamp).toBe('2026-01-01T00:00:00');
  });
});

describe('parseCountInput', () => {
  it('parses a non-negative integer', () => {
    expect(parseCountInput('12')).toBe(12);
    expect(parseCountInput('0')).toBe(0);
  });

  it('treats an emptied cell as cleared', () => {
    expect(parseCountInput('')).toBeUndefined();
    expect(parseCountInput('   ')).toBeUndefined();
  });

  it('refuses decimals and negatives rather than truncating them', () => {
    // parseInt would have made these 5, 0 and -1.
    expect(parseCountInput('5.5')).toBeNull();
    expect(parseCountInput('.5')).toBeNull();
    expect(parseCountInput('-1')).toBeNull();
    expect(parseCountInput('abc')).toBeNull();
  });
});

describe('getSlotDateBounds', () => {
  const slots = [
    { slotIndex: 1, countDt: '2024-11-04' },
    { slotIndex: 2 },
    { slotIndex: 3, countDt: '2024-11-07' },
    { slotIndex: 4 }
  ];

  // The bounds are exclusive: validateCountDates wants each date strictly
  // after the one before it, so the picker has to stop a day short either way.
  it('bounds a slot by the nearest dated slots either side of it', () => {
    expect(getSlotDateBounds(slots, 2)).toEqual({
      minDate: '2024/11/05',
      maxDate: '2024/11/06'
    });
  });

  it('leaves the open end unbounded', () => {
    expect(getSlotDateBounds(slots, 1)).toEqual({
      minDate: undefined,
      maxDate: '2024/11/06'
    });
    expect(getSlotDateBounds(slots, 4)).toEqual({
      minDate: '2024/11/08',
      maxDate: undefined
    });
  });

  // Editing a dated slot must not bound it by its own date.
  it('ignores the slot being edited', () => {
    expect(getSlotDateBounds(slots, 3)).toEqual({
      minDate: '2024/11/05',
      maxDate: undefined
    });
  });
});
