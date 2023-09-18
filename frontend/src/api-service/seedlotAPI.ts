import ApiConfig from './ApiConfig';
import api from './api';

export const getSeedlotInfo = (seedlotNumber: string) => {
  const url = `${ApiConfig.seedlot}/${seedlotNumber}`;
  return api.get(url).then((res) => res.data);
};

export const postFile = (
  file: File,
  isMixFile: boolean
) => {
  const url = isMixFile ? ApiConfig.uploadSMPMix : ApiConfig.uploadConeAndPollen;
  const formData = new FormData();
  formData.append('file', file);
  return api.post(url, formData, true);
};
