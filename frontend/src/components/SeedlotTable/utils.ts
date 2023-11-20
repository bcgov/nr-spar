import { SeedlotDisplayType } from '../../types/SeedlotType';

export const sortByKey = (
  dataToSort: SeedlotDisplayType[],
  headerId: keyof SeedlotDisplayType | null,
  direction: string
) => {
  if (headerId && direction === 'ASC') {
    return dataToSort.sort((a, b) => {
      if (a[headerId] > b[headerId]) {
        return 1;
      }
      if (a[headerId] < b[headerId]) {
        return -1;
      }
      return 0;
    });
  }
  if (headerId && direction === 'DESC') {
    return dataToSort.sort((a, b) => {
      if (a[headerId] < b[headerId]) {
        return 1;
      }
      if (a[headerId] > b[headerId]) {
        return -1;
      }
      return 0;
    });
  }
  return dataToSort;
};
