import ApiConfig from './ApiConfig';
import api from './api';

const getFacilityTypes = () => {
  const url = ApiConfig.facilityTypes;
  return api.get(url).then((res) => res.data);
};

export default getFacilityTypes;
