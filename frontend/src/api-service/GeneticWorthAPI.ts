import { GeneticWorthDto } from '../types/GeneticWorthType';
import ApiConfig from './ApiConfig';
import api from './api';

const getGeneticWorthList = () => {
  const url = ApiConfig.geneticWothList;
  return api.get(url).then((res): GeneticWorthDto[] => res.data);
};

export default getGeneticWorthList;
