import { SeedlotDisplayType } from '../../types/SeedlotType';

const dateSort = (x: SeedlotDisplayType['createdAt'], y: SeedlotDisplayType['createdAt']) => {
  const dateX = new Date(x).getTime();
  const dateY = new Date(y).getTime();
  return dateX - dateY;
};

export const sortByKey = (
  dataToSort: SeedlotDisplayType[],
  headerId: keyof SeedlotDisplayType | null,
  direction: string
) => {
  if (headerId && ['createdAt', 'lastUpdatedAt'].includes(headerId)) {
    return dataToSort.sort((a, b) => {
      const result = dateSort(a[headerId], b[headerId]);
      return direction === 'ASC' ? result : -result;
    });
  }
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
