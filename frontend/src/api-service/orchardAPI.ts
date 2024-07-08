import OrchardDataType from '../types/OrchardDataType';
import ApiConfig from './ApiConfig';
import api from './api';

export const getOrchardByID = (orchardId: string) => {
  const url = `${ApiConfig.oracleOrchards}/${orchardId}`;
  return api.get(url).then((res) => res.data);
};

export const getSeedPlanUnits = (orchardId: string) => {
  const url = `${ApiConfig.orchards}/${orchardId}/seed-plan-units?active=true`;
  return api.get(url).then((res) => res.data);
};

export const getAllParentTrees = (vegCode: string) => {
  const url = `${ApiConfig.orchards}/parent-trees/vegetation-codes/${vegCode}`;
  return api.get(url).then((res) => res.data);
};

export const getOrchardByVegCode = (vegCode: string) => {
  const url = `${ApiConfig.orchardsVegCode}/${vegCode}`;
  return api.get(url).then((res): OrchardDataType[] => res.data);
};
