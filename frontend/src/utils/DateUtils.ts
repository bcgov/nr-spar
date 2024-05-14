export const formatDate = (date: string) => {
  if (date) {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(`${date}T00:00:00-08:00`).toLocaleDateString([], options);
  }
  return '--';
};

export const dateStringToISO = (date: string): string => {
  if (date) {
    return new Date(date).toISOString();
  }
  return '';
};
