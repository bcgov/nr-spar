import ApiConfig from './ApiConfig';
import api from './api';

const getFundingSources = () => {
  const url = ApiConfig.fundingSource;
  return api.get(url).then((res) => res.data);
};

export default getFundingSources;
