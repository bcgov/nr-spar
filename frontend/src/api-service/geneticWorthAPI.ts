import { GenWorthCalcPayload } from '../types/GeneticWorthTypes';
import ApiConfig from './ApiConfig';
import api from './api';

export const postForCalculation = (data: GenWorthCalcPayload[]) => {
  const url = ApiConfig.geneticWorth;
  return api.post(url, data);
};

export default postForCalculation;
