import ApiConfig from './ApiConfig';
import api from './api';

export const getSeedlotInfo = (seedlotNumber: string) => {
  const url = `${ApiConfig.seedlot}/${seedlotNumber}`;
  return api.get(url).then((res) => res.data);
};

export const postConeAndPollenFile = (seedlotNumber: string, coneFile: File) => {
  const url = ApiConfig.uploadConeAndPollen.replace('{seedlotNumber}', seedlotNumber);
  // const url = `https://nr-spar-test-backend.apps.silver.devops.gov.bc.ca/api/seedlots/${seedlotNumber}/parent-trees-contribution/cone-pollen-count-table/upload`;
  return api.post(url, coneFile, true);
};
