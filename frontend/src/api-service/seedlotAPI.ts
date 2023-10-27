import { SeedlotRegPayloadType } from '../types/SeedlotRegistrationTypes';
import ApiConfig from './ApiConfig';
import api from './api';

export const getSeedlotInfo = (seedlotNumber: string) => {
  const url = `${ApiConfig.seedlot}/${seedlotNumber}`;
  return api.get(url).then((res) => res.data);
};

export const postSeedlot = (payload: SeedlotRegPayloadType) => {
  const url = ApiConfig.seedlots;
  return api.post(url, payload);
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

export const getSeedlotByUser = (userId: string) => {
  const url = `${ApiConfig.seedlots}/users/${userId}`;
  return api.get(url).then((res) => res.data);
};
