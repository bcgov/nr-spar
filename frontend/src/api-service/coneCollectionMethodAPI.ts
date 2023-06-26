import ApiConfig from './ApiConfig';
import api from './api';

const getConeCollectionMethod = () => {
  const url = ApiConfig.coneCollectionMethod;
  return api.get(url).then((res) => res.data);
};

export default getConeCollectionMethod;
