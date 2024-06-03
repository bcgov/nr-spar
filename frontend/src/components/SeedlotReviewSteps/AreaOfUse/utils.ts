import { SeedPlanZoneDto } from '../../../types/SeedlotType';

export const formatSpz = (spzDto: SeedPlanZoneDto) => (
  `${spzDto.code} - ${spzDto.description}`
);

export const formatSpzList = (spzDtoList: SeedPlanZoneDto[]) => (
  spzDtoList.map((spzDto) => formatSpz(spzDto)).join(', ')
);

export const formatLatLong = (
  degree: number | undefined,
  minute: number | undefined,
  second: number | undefined
): string => {
  // Use undefined comparison instead of `!second` since second can be 0
  if (degree === undefined || minute === undefined || second === undefined) {
    return '';
  }

  return `${degree}° ${minute}' ${second}"`;
};
