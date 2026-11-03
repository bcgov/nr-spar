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

export default isDateRangeOrdered;
