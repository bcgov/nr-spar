import { OrchardObj } from '../OrchardStep/definitions';
import { RowItem } from './definitions';

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

export const sortRowItem = (rows: Array<RowItem>) => (
  rows.sort((a: RowItem, b: RowItem) => Number(a.clone_number) - Number(b.clone_number))
);
