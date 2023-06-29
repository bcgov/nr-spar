import ApiConfig from './ApiConfig';
import api from './api';

export const getOrchardByID = (orchardID: string) => {
  const url = `${ApiConfig.oracleOrchards}/${orchardID}`;
  return api.get(url).then((res) => res.data);
};

export const getSeedPlanUnits = (orchardID: string) => {
  const url = `${ApiConfig.orchards}/${orchardID}/seed-plan-units?active=true`;
  return api.get(url).then((res) => res.data);
};

export const getParentTreeGeneQuali = (orchardID: string) => {
  const url = `${ApiConfig.orchards}/${orchardID}/parent-tree-genetic-quality`;
  return api.get(url).then((res) => res.data);
};
