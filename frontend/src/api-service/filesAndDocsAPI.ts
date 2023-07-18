import ApiConfig from './ApiConfig';
import api from './api';

const getFilesAndDocs = () => {
  const url = ApiConfig.filesAndDocs;
  return api.get(url).then((res) => res.data);
};

export default getFilesAndDocs;
