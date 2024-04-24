import { PtValsCalcReqPayload } from '../types/PtCalcTypes';
import ApiConfig from './ApiConfig';
import api from './api';

export const postForCalculation = (data: PtValsCalcReqPayload) => {
  const url = ApiConfig.parentTreeValsCalc;
  return api.post(url, data);
};

export default postForCalculation;
