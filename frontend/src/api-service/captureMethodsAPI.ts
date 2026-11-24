import ApiConfig from './ApiConfig';
import api from './api';
import { CodeDescResType } from '../types/CodeDescResType';

const getCaptureMethods = () => {
  const url = ApiConfig.captureMethods;
  return api.get(url).then((res): CodeDescResType[] => res.data);
};

export default getCaptureMethods;
