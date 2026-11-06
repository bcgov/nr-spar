import ApiConfig from './ApiConfig';
import api from './api';

import { SeedPlanZoneOracleDto } from '../types/SeedlotType';

export const getSpzByVegCodeList = (vegCode: string, geneticClass: 'A' | 'B' = 'A') => {
  const url = `${ApiConfig.areaOfUseSpzList}/${vegCode}?geneticClass=${geneticClass}`;
  return api.get(url).then((res): SeedPlanZoneOracleDto[] => res.data);
};
