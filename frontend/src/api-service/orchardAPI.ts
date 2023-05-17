import ApiConfig from './ApiConfig';
import api from './api';

const getOrchardByID = (orchardID: string) => {
  const url = `${ApiConfig.orchard}/${orchardID}`;
  return api.get(url).then((res) => res.data);
};

export default getOrchardByID;
