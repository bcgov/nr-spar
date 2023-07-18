import MultiOptionsObj from '../types/MultiOptionsObject';
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

export const getParentTreeGeneQuali = (orchardId: string | undefined) => {
  if (orchardId) {
    const url = `${ApiConfig.orchards}/${orchardId}/parent-tree-genetic-quality`;
    return api.get(url).then((res) => res.data);
  }
  throw new Error('orchardId is undefined in url params');
};

export const getOrchardByVegCode = (vegCode: string) => {
  const url = `${ApiConfig.orchardsVegCode}/${vegCode}`;
  return api.get(url).then((res) => {
    const unSortedList: Array<MultiOptionsObj> = [];
    res.data
      .forEach((orchard: OrchardDataType) => (
        unSortedList.push({
          code: orchard.id,
          description: orchard.name,
          label: `${orchard.id} - ${orchard.name} - ${orchard.lotTypeCode} - ${orchard.stageCode}`
        })
      ));
    return unSortedList.sort((a, b) => Number(a.code) - Number(b.code));
  });
};
