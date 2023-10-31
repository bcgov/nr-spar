import ApiConfig from './ApiConfig';
import api from './api';

export const getForestClientLocation = (clientNumber: string, locationCode: string) => {
  const url = `${ApiConfig.forestClient}/${clientNumber}/location/${locationCode}`;
  return api.get(url).then((res) => res.data);
};

export const getForestClientByNumber = (clientNumber: string) => {
  const url = `${ApiConfig.forestClient}/${clientNumber}`;
  return api.get(url).then((res) => res.data);
};
