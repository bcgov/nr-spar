import { OrchardObj } from '../OrchardStep/definitions';
import { RowItem, InfoSectionConfigType } from './definitions';
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

const sortRowItems = (rows: Array<RowItem>) => (
  rows.sort((a: RowItem, b: RowItem) => Number(a.clone_number) - Number(b.clone_number))
);

const sliceRowItems = (rows: Array<RowItem>, pageNumber: number, pageSize: number) => (
  rows.slice((pageNumber - 1) * pageSize).slice(0, pageSize)
);

export const sortAndSliceRows = (
  rows: Array<RowItem>,
  pageNumber: number,
  pageSize: number,
  sliceOnly: boolean
) => {
  let sorted = rows;
  if (!sliceOnly) {
    sorted = sortRowItems(rows);
  }
  const sliced = sliceRowItems(sorted, pageNumber, pageSize);
  return sliced;
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
