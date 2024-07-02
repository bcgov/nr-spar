import ApiConfig from './ApiConfig';
import api from './api';
import VegCode from '../types/VegetationCodeType';

const getVegCodes = () => {
  const url = ApiConfig.vegetationCode;
  return api.get(url).then((res): VegCode[] => res.data);
};

export default getVegCodes;
