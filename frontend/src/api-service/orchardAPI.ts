import MultiOptionsObj from '../types/MultiOptionsObject';
import OrchardDataType from '../types/OrchardDataType';
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
