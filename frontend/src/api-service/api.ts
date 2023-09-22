import axios from 'axios';
import { getUserFromStorage } from '../service/AuthService';

const getHeader = (useMultipart = false) => {
  const famUser = getUserFromStorage();

  console.log(`token for api ${famUser?.authToken}`);
  let headers = {
    Authorization: `Bearer ${famUser?.authToken}`
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
