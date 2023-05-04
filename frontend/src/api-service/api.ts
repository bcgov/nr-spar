import axios from 'axios';
import KeycloakService from '../service/KeycloakService';

const getHeader = () => {
  const token = KeycloakService.getToken();
  return {
    Authorization: `Bearer ${token}`
  };
};

const api = {
  get: (url: string, params?: object) => axios.get(url, {
    headers: getHeader(),
    ...params
  }),

  post: (url: string, data: any) => axios.post(url, data, {
    headers: getHeader()
  }),

  put: (url: string, data: any) => axios.put(url, data, {
    headers: getHeader()
  }),

  patch: (url: string, data: any) => axios.patch(url, data, {
    headers: getHeader()
  }),

  delete: (url: string) => axios.delete(url, {
    headers: getHeader()
  })
};

export default api;
