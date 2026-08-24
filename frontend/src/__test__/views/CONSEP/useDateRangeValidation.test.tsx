import { act, renderHook } from '@testing-library/react';
import {
  isDateRangeOrdered,
  useDateRangeValidation
} from '../../../views/CONSEP/TestingActivities/hooks/useDateRangeValidation';

describe('useDateRangeValidation', () => {
  const messages = {
    startDate: 'Please enter a valid date',
    endDate: 'Please enter a valid date'
  };

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

  it('sets and clears date errors from validation results', () => {
    const { result } = renderHook(() => useDateRangeValidation(messages));

    act(() => {
      const isValid = result.current.validateDateRange(
        new Date('2025-06-15T00:00:00.000Z'),
        new Date('2025-06-11T00:00:00.000Z')
      );
      expect(isValid).toBe(false);
    });

    expect(result.current.dateErrors).toEqual(messages);

    act(() => {
      const isValid = result.current.validateDateRange(
        new Date('2025-06-10T00:00:00.000Z'),
        new Date('2025-06-11T00:00:00.000Z')
      );
      expect(isValid).toBe(true);
    });

    expect(result.current.dateErrors).toEqual({});
  });
});
