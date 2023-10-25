import SeedlotSourceType from '../types/SeedlotSourceType';
import ApiConfig from './ApiConfig';
import api from './api';

const getSeedlotSources = () => {
  const url = ApiConfig.seedlotSources;
  // The sorting is to put the tested parent tree at the top, custom at the bottom.
  return api.get(url).then((res) => res.data.sort((a: SeedlotSourceType) => {
    if (a.code.startsWith('C')) return 1;
    if (a.code.startsWith('T')) return -1;
    return 0;
  }));
};

export default getSeedlotSources;
