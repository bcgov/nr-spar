import { useState } from 'react';

type DateRangeMessages = {
  startDate: string;
  endDate: string;
};

type DateRangeErrors = {
  startDate?: string;
  endDate?: string;
};

const toDateOnlyTime = (date: Date) => Date.UTC(
  date.getUTCFullYear(),
  date.getUTCMonth(),
  date.getUTCDate()
);

export const isDateRangeOrdered = (startDate: Date | null, endDate: Date | null) => {
  if (!startDate || !endDate) {
    return true;
  }

  return toDateOnlyTime(startDate) <= toDateOnlyTime(endDate);
};

export const useDateRangeValidation = (messages: DateRangeMessages) => {
  const [dateErrors, setDateErrors] = useState<DateRangeErrors>({});

  const validateDateRange = (startDate: Date | null, endDate: Date | null) => {
    if (isDateRangeOrdered(startDate, endDate)) {
      setDateErrors({});
      return true;
    }

    setDateErrors({
      startDate: messages.startDate,
      endDate: messages.endDate
    });
    return false;
  };

  return { dateErrors, validateDateRange };
};

export default useDateRangeValidation;
