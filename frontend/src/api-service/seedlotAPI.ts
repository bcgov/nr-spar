import ApiConfig from './ApiConfig';
import api from './api';

export const getSeedlotInfo = (seedlotNumber: string) => {
  const url = `${ApiConfig.seedlot}/${seedlotNumber}`;
  return api.get(url).then((res) => res.data);
};

export const postCompositionFile = (
  compositionFile: File
) => {
  const url = ApiConfig.uploadConeAndPollen;
  const formData = new FormData();
  formData.append('file', compositionFile);
  return api.post(url, formData, true);
};
