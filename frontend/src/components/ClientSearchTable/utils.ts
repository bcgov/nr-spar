import { ForestClientSearchType } from '../../types/ForestClientTypes/ForestClientSearchType';

export const sortByKey = (
  dataToSort: ForestClientSearchType[],
  headerId: keyof ForestClientSearchType | null,
  direction: string
) => {
  // sort is inplace but we don't want that.
  const data = structuredClone(dataToSort);
  if (headerId && direction === 'ASC') {
    return data.sort((a, b) => {
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
    return data.sort((a, b) => {
      if (a[headerId] < b[headerId]) {
        return 1;
      }
      if (a[headerId] > b[headerId]) {
        return -1;
      }
      return 0;
    });
  }

  return data;
};
