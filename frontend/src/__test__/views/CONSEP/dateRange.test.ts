import { isDateRangeOrdered } from '../../../views/CONSEP/TestingActivities/hooks/dateRange';

describe('isDateRangeOrdered', () => {
  it('treats null dates as valid', () => {
    expect(isDateRangeOrdered(null, null)).toBe(true);
    expect(isDateRangeOrdered(new Date('2025-06-10T00:00:00.000Z'), null)).toBe(true);
    expect(isDateRangeOrdered(null, new Date('2025-06-10T00:00:00.000Z'))).toBe(true);
  });

  it('returns false when start date is after end date', () => {
    expect(
      isDateRangeOrdered(
        new Date('2025-06-15T00:00:00.000Z'),
        new Date('2025-06-11T00:00:00.000Z')
      )
    ).toBe(false);
  });

  it('treats same-day values as valid even with different times', () => {
    expect(
      isDateRangeOrdered(
        new Date('2025-06-11T14:00:00.000Z'),
        new Date('2025-06-11T09:00:00.000Z')
      )
    ).toBe(true);
  });
});
