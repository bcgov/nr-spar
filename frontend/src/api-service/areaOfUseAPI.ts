import ApiConfig from './ApiConfig';
import api from './api';

import { SeedPlanZoneOracleDto } from '../types/SeedlotType';

export const getSpzList = () => {
  const url = ApiConfig.areaOfUseTestedPtSpz;
  return api.get(url).then((res): SeedPlanZoneOracleDto[] => res.data);
};
