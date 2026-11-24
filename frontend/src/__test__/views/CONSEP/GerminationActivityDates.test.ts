/* eslint-disable no-undef */
import { describe, it, expect } from 'vitest';
import {
  validateActivityDates, buildHeaderUpdate, activityDatesFromHeader, validateCountDates
} from '../../../views/CONSEP/TestingActivities/GerminationContent/utils';
import { GerminationTestHeaderType } from '../../../types/consep/GerminationType';

const TODAY = '2026-05-20';

describe('validateActivityDates', () => {
  it('accepts begin on the first count date and end after begin', () => {
    expect(validateActivityDates(
      { seedWithdrawalDate: '2026-05-01', beginDate: '2026-05-04', endDate: '2026-05-19' },
      '2026-05-04',
      TODAY
    )).toEqual({});
  });

  it('rejects begin after the first count date', () => {
    expect(validateActivityDates({ beginDate: '2026-05-05' }, '2026-05-04', TODAY).beginDate)
      .toBe('Begin date cannot be after the first count date');
  });

  it('requires begin once counts are entered', () => {
    expect(validateActivityDates({}, '2026-05-04', TODAY).beginDate)
      .toBe('Begin date is required once germination counts are entered');
  });

  it('requires begin once a test end is entered', () => {
    expect(validateActivityDates({ endDate: '2026-05-19' }, undefined, TODAY).beginDate)
      .toBe('Begin date is required when a test end date is entered');
  });

  it('rejects future withdrawal and begin dates', () => {
    const errors = validateActivityDates(
      { seedWithdrawalDate: '2026-05-21', beginDate: '2026-05-21' },
      undefined,
      TODAY
    );
    expect(errors.seedWithdrawalDate).toBe('Withdrawal date cannot be in the future');
    expect(errors.beginDate).toBe('Begin date cannot be in the future');
  });

  it('rejects an end that is not after begin', () => {
    expect(validateActivityDates(
      { beginDate: '2026-05-04', endDate: '2026-05-04' },
      undefined,
      TODAY
    ).endDate).toBe('Test end must be after the begin date');
  });
});

describe('buildHeaderUpdate', () => {
  const header: GerminationTestHeaderType = {
    riaSkey: 1,
    activityTypeCd: 'G10',
    testCategoryCd: 'STD',
    acceptResultInd: 0,
    testCompleteInd: -1,
    germinatorId: 'B',
    riaComment: 'note',
    intrmdtCleanrInd: -1,
    seedWithdrawalDate: '2026-05-01',
    actualBeginDtTm: '2026-05-04T08:30:00',
    testResultUpdateTimestamp: '2026-05-10T10:00:00',
    riaUpdateTimestamp: '2026-05-10T11:00:00'
  };

  it('round-trips the header unchanged', () => {
    expect(buildHeaderUpdate(header, activityDatesFromHeader(header))).toEqual({
      testCategoryCode: 'STD',
      acceptResultInd: false,
      // Legacy stores true as -1.
      testCompleteInd: true,
      germinatorId: 'B',
      seedWithdrawalDate: '2026-05-01',
      actualBeginDateTime: '2026-05-04T08:30:00',
      actualEndDateTime: undefined,
      riaComment: 'note',
      commentIsCritical: true,
      testResultUpdateTimestamp: '2026-05-10T10:00:00',
      riaUpdateTimestamp: '2026-05-10T11:00:00'
    });
  });

  it('keeps the stored time of day and defaults a new date to midnight', () => {
    const payload = buildHeaderUpdate(header, { beginDate: '2026-05-03', endDate: '2026-05-24' });
    expect(payload.actualBeginDateTime).toBe('2026-05-03T08:30:00');
    expect(payload.actualEndDateTime).toBe('2026-05-24T00:00:00');
  });
});

describe('validateCountDates with a begin date', () => {
  it('flags a first count date before the begin date', () => {
    const slots = [{ slotIndex: 2, countDt: '2026-05-03' }, { slotIndex: 3, countDt: '2026-05-06' }];
    expect(validateCountDates(slots, '2026-05-04')).toEqual({
      'slot-2': 'Count date cannot be before the test begin date'
    });
    expect(validateCountDates(slots, '2026-05-03')).toEqual({});
  });
});
