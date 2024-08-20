import { ParentTreeByVegCodeResType } from '../types/ParentTreeTypes';
import { PtValsCalcReqPayload } from '../types/PtCalcTypes';
import ApiConfig from './ApiConfig';
import api from './api';

export const postForCalculation = (data: PtValsCalcReqPayload) => {
  const url = ApiConfig.parentTreeValsCalc;
  return api.post(url, data);
};

export const getAllParentTrees = (vegCode: string) => {
  const url = ApiConfig.parentTreeByVegCode.replace('{vegCode}', vegCode);
  return api.get(url).then((res): ParentTreeByVegCodeResType => res.data);
};

export default postForCalculation;
