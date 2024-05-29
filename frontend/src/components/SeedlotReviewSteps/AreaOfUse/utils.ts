import { SeedPlanZoneDto } from '../../../types/SeedlotType';

export const formatSpz = (spzDto: SeedPlanZoneDto) => (
  `${spzDto.code} - ${spzDto.description}`
);

export const formatSpzList = (spzDtoList: SeedPlanZoneDto[]) => (
  spzDtoList.map((spzDto) => formatSpz(spzDto)).join(', ')
);
