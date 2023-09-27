import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const getHeader = (useMultipart = false) => {
  const { token } = useAuth();

  let headers = {
    // Until we have the backend ready for receiving the actual token,
    // let's have a simple header with user identification
    'Temporary-User-Identification': token
    // Authorization: `Bearer ${token}`
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
