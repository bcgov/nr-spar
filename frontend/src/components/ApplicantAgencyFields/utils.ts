/**
 * Format single digit location code to have a leading 0.
 */
export const formatLocationCode = (value: string) => (value.length > 1 ? value : value.padStart(2, '0'));
