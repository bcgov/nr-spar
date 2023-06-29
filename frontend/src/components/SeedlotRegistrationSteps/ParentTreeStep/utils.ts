import { OrchardObj } from '../OrchardStep/definitions';
import { RowItem, InfoSectionConfigType } from './definitions';
import { EMPTY_NUMBER_STRING } from './constants';
import InfoDisplayObj from '../../../types/InfoDisplayObj';

export const getTabString = (selectedIndex: number) => {
  switch (selectedIndex) {
    case 0:
      return 'coneTab';
    case 1:
      return 'successTab';
    case 2:
      return 'mixTab';
    default:
      return 'coneTab';
  }
};

// Returns a merged array of orchards, duplicated orchards are merged as one
export const processOrchards = (orchards: Array<OrchardObj>): Array<OrchardObj> => {
  const obj = {};

  orchards.forEach((orchard) => {
    if (
      !Object.prototype.hasOwnProperty.call(obj, orchard.orchardId)
      && orchard.orchardId !== ''
      && orchard.orchardLabel !== ''
    ) {
      Object.assign(obj, {
        [orchard.orchardId]: orchard
      });
    }
  });

  return Object.values(obj);
};

export const combineObjectValues = (objs: Array<InfoSectionConfigType>): Array<InfoDisplayObj> => {
  let combined: Array<InfoDisplayObj> = [];

  objs.forEach((obj) => {
    const vals = Object.values(obj);
    combined = [
      ...combined,
      ...vals
    ];
  });

  return combined;
};

export const calcAverage = (tableRows: Array<RowItem>, field: string): string => {
  let sum = 0;
  let total = tableRows.length;
  tableRows.forEach((row) => {
    // add if the value is not null
    if (row[field]) {
      sum += Number(row[field]);
    } else {
      total -= 1;
    }
  });

  const average = (sum / total).toFixed(2);

  // No value for calculation, 0 / 0 will result in NaN
  if (total === 0) return EMPTY_NUMBER_STRING;

  // If the value is an integer return the whole number
  if (Number(average) % 1 === 0) {
    return Number(average).toFixed(0);
  }
  return average;
};

export const calcSum = (tableRows: Array<RowItem>, field: string): string => {
  let sum = 0;

  tableRows.forEach((row) => {
    // add if the value is not null
    if (row[field]) {
      sum += Number(row[field]);
    }
  });
  return sum.toString();
};
