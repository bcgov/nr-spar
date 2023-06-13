import ApiConfig from './ApiConfig';
import api from './api';

export const getOrchardByID = (orchardID: string) => {
  const url = `${ApiConfig.orchard}/${orchardID}`;
  return api.get(url).then((res) => res.data);
};

export const getSeedPlanUnits = (orchardID: string) => {
  const url = `${ApiConfig.orchardSeedPlan}/${orchardID}/seed-plan-units?active=true`;
  return api.get(url).then((res) => res.data);
};

export const getParentTreeGeneQuali = (orchardID: string, spu: string) => {
  const url = `${ApiConfig.parentTreeGeneticQuality}/${orchardID}/${spu}`;
  return api.get(url).then((res) => res.data);
};
