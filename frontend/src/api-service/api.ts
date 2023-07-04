import axios from 'axios';
import KeycloakService from '../service/KeycloakService';

const getHeader = (useMultipart = false) => {
  const token = KeycloakService.getToken();
  let headers = {
    Authorization: `Bearer ${token}`
  };
  if (useMultipart) {
    headers = Object.assign(headers, { 'content-type': 'multipart/form-data' });
  }
  return headers;
};

const api = {
  get: (url: string, params?: object) => axios.get(url, {
    headers: getHeader(),
    ...params
  }),

  post: (url: string, data: any, useMultipart = false) => axios.post(url, data, {
    headers: getHeader(useMultipart)
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
