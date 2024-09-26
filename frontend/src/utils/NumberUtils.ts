import BigNumber from 'bignumber.js';

/**
 * A float validator, the validator.isFloat() cannot handle high precision comparing.
 */
export const isFloatWithinRange = (value: string, min: string, max: string): boolean => (
  new BigNumber(value).isGreaterThanOrEqualTo(min)
  && new BigNumber(value).isLessThanOrEqualTo(max)
);

export const isNumeric = (value: string) => /^-?\d+$/.test(value);
