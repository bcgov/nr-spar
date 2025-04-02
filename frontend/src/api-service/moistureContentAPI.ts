import ApiConfig from './ApiConfig';
import api from './api';

export const getMccByRiaKey = (riaKey: string) => {
  const url = `${ApiConfig.moistureContent}/${riaKey}`;
  return api.get(url).then((res) => res.data);
};
