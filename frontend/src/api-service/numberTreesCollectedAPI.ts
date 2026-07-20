import ApiConfig from './ApiConfig';
import api from './api';
import { CodeDescResType } from '../types/CodeDescResType';

const getNumberTreesCollected = () => {
  const url = ApiConfig.numberTreesCollected;
  return api.get(url).then((res): CodeDescResType[] => res.data);
};

export default getNumberTreesCollected;
