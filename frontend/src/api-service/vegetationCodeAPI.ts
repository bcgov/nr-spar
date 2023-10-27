import ApiConfig from './ApiConfig';
import api from './api';
import { getMultiOptList } from '../utils/MultiOptionsUtils';
import MultiOptionsObj from '../types/MultiOptionsObject';
import VegCode from '../types/VegetationCodeType';
import { geneticWorthDict } from '../components/SeedlotRegistrationSteps/ParentTreeStep/constants';

// Remove VegCodes with these codes
const codesToFilter: Array<string> = [
  'AMELALN',
  'ARCTUVA',
  'CEANSAN',
  'CEANVEL',
  'CORNSTO',
  'DG',
  'DRYADRU',
  'LA',
  'LARIDEC',
  'LARIKAE',
  'LD',
  'MAHOREP',
  'PINUSYL',
  'POTEFRU',
  'PRUNVIR',
  'SA',
  'SHEPCAN',
  'SPIRBET'
];

const getVegCodes = (isAClass = false, useRawData = false) => {
  const url = ApiConfig.vegetationCode;
  return api.get(url).then((res) => {
    // Return a list of veg code as it is from the backend
    if (useRawData) {
      return res.data;
    }
    // Else return an array of objs for dropdown/combobox
    let vegCodeOptions: Array<MultiOptionsObj> = [];
    if (res.data) {
      let filteredData = res.data
        .filter((vegCode: VegCode) => codesToFilter.indexOf(vegCode.code) === -1);
      if (isAClass) {
        const aClassCodes = Object.keys(geneticWorthDict);
        filteredData = filteredData
          .filter((vegCode: VegCode) => aClassCodes.includes(vegCode.code));
      }
      vegCodeOptions = getMultiOptList(filteredData, true, true);
    }
    return vegCodeOptions;
  });
};

export default getVegCodes;
