import ApiConfig from './ApiConfig';
import api from './api';

const getGameticMethodology = () => {
  const url = ApiConfig.gameticMethodology;
  return api.get(url).then((res) => res.data);
};

export default getGameticMethodology;
