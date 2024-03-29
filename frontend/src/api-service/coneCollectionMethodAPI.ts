import ApiConfig from './ApiConfig';
import api from './api';
import { CodeDescResType } from '../types/CodeDescResType';

const getConeCollectionMethod = () => {
  const url = ApiConfig.coneCollectionMethod;
  return api.get(url).then((res): CodeDescResType[] => res.data);
};

export default getConeCollectionMethod;
