import ApiConfig from './ApiConfig';
import api from './api';

const getSeedlotInfo = (seedlotNumber: string) => {
  const url = `${ApiConfig.seedlot}/${seedlotNumber}`;
  return api.get(url).then((res) => res.data);
};

export default getSeedlotInfo;
