import ApiConfig from './ApiConfig';
import api from './api';
import { CodeDescResType } from '../types/CodeDescResType';

const getSeedCoastAreas = () => {
  const url = ApiConfig.seedCoastAreas;
  return api.get(url).then((res): CodeDescResType[] => res.data);
};

export default getSeedCoastAreas;
