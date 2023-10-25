import ApiConfig from './ApiConfig';
import api from './api';

const getSeedlotSources = () => {
  const url = ApiConfig.seedlotSources;
  return api.get(url).then((res) => res.data);
};

export default getSeedlotSources;
