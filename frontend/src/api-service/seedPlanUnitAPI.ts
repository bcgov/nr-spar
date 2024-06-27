import ApiConfig from './ApiConfig';
import api from './api';

export const getSpuById = (spuId: string) => {
  const url = `${ApiConfig.seedPlanUnit}/${spuId}`;
  return api.get(url).then((res) => res.data);
};
