import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { SeedPlanZoneDto, SeedPlanZoneOracleDto } from '../../../types/SeedlotType';

export const formatSpz = (spzDto: SeedPlanZoneDto) => (
  `${spzDto.code} - ${spzDto.description}`
);

export const spzListToString = (spzDtoList: SeedPlanZoneDto[]) => (
  spzDtoList.map((spzDto) => formatSpz(spzDto)).join(', ')
);

export const formatLatLong = (
  degree: number | null | undefined,
  minute: number | null | undefined,
  second: number | null | undefined
): string => {
  // Use undefined comparison instead of `!second` since second can be 0
  if (degree === undefined || minute === undefined || second === undefined) {
    return '';
  }

  return `${degree}° ${minute}' ${second}"`;
};

/**
 * Converts spz list from oracle to a list of MultiOptionObj.
 */
export const spzListToMultiObj = (spzList: SeedPlanZoneOracleDto[]): MultiOptionsObj[] => {
  const result: MultiOptionsObj[] = spzList.map((spzDto) => (
    {
      code: spzDto.code,
      description: spzDto.description,
      label: `${spzDto.code} - ${spzDto.description}`
    }
  ));

  return result;
};

/**
 * Returns a list of MultiOptionObj that aren't being selected.
 */
export const filterSpzListItem = (
  spzMultiOptionList: MultiOptionsObj[] | undefined,
  existingSpzMultiObjs: MultiOptionsObj[]
): MultiOptionsObj[] => {
  if (!spzMultiOptionList) {
    return [];
  }

  const existingSpzCodes = existingSpzMultiObjs.map((spz) => spz.code);
  return spzMultiOptionList.filter((spz) => !existingSpzCodes.includes(spz.code));
};
