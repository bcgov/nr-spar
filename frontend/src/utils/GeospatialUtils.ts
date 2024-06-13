import { DmsType } from '../types/GeospatialTypes';

const SCALE = 60;

/**
 * Converts Degree Minute Second to Second
 */
export const dmsToSecond = (dms: DmsType): number => {
  let { second: totalSecond } = dms;

  totalSecond += dms.minute * SCALE;

  totalSecond += dms.degree * (SCALE ** 2);

  return totalSecond;
};
