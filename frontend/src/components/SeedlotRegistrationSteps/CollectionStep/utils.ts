import { MAX_INPUT_DECIMAL } from './constants';

/**
 * Calculate volume_of_cones = num_of_container * vol_per_container.
 */
export const calcVolume = (numOfContainer: string, volPerContainer: string) => (
  (Number(numOfContainer) * Number(volPerContainer)).toFixed(3)
);

/**
 * Only for number of container and vol per container.
 */
export const isNumNotInRange = (value: string): boolean => (
  !((Number(value) > 0) && (Number(value) < MAX_INPUT_DECIMAL))
);

/**
 * Format single digit location code to have a leading 0.
 */
export const formatLocationCode = (value: string) => (value.length > 1 ? value : value.padStart(2, '0'));
