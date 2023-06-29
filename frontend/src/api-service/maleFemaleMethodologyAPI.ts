import ApiConfig from './ApiConfig';
import api from './api';

const getMaleFemaleMethodology = () => {
  const url = ApiConfig.maleFemaleMethodology;
  return api.get(url).then((res) => res.data);
};

export default getMaleFemaleMethodology;
