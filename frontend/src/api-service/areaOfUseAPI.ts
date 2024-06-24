import ApiConfig from './ApiConfig';
import api from './api';

import { SeedPlanZoneOracleDto } from '../types/SeedlotType';

export const getSpzByVegCodeList = (vegCode: string) => {
  const url = `${ApiConfig.areaOfUseSpzList}/${vegCode}`;
  return api.get(url).then((res): SeedPlanZoneOracleDto[] => res.data);
};
