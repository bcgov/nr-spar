import ApiConfig from './ApiConfig';
import api from './api';

const getApplicantAgencies = () => {
  const url = ApiConfig.applicantAgencies;
  return api.get(url).then((res) => res.data);
};

export default getApplicantAgencies;
