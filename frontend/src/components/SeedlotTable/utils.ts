import { SeedlotDisplayType } from '../../types/SeedlotType';

const compareSeedlotDates = (
  dateValueA: string,
  dateValueB: string
) => {
  const timestampA = new Date(dateValueA).getTime();
  const timestampB = new Date(dateValueB).getTime();
  return timestampA - timestampB;
};

export const sortSeedlotsByKey = (
  seedlotData: SeedlotDisplayType[],
  sortKey: keyof SeedlotDisplayType | null,
  sortDirection: 'ASC' | 'DESC' | 'NONE'
): SeedlotDisplayType[] => {
  if (!sortKey || sortDirection === 'NONE') {
    return seedlotData;
  }

  const isDateField = sortKey === 'createdAt' || sortKey === 'lastUpdatedAt';

  return [...seedlotData].sort((seedlotA, seedlotB) => {
    let comparison = 0;

    if (isDateField) {
      comparison = compareSeedlotDates(
        seedlotA[sortKey] as string,
        seedlotB[sortKey] as string
      );
    } else if (seedlotA[sortKey] > seedlotB[sortKey]) {
      comparison = 1;
    } else if (seedlotA[sortKey] < seedlotB[sortKey]) {
      comparison = -1;
    } else {
      comparison = 0;
    }

    return sortDirection === 'ASC' ? comparison : -comparison;
  });
};
