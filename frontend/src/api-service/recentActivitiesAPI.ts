import ApiConfig from './ApiConfig';
import api from './api';

const getRecentActivities = () => {
  const url = ApiConfig.recentActivities;
  return api.get(url).then((res) => res.data);
};

export default getRecentActivities;
