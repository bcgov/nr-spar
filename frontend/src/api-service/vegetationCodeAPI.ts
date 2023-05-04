import ApiConfig from './ApiConfig';
import api from './api';
import { getDropDownList } from '../utils/DropDownUtils';
import DropDownObj from '../types/DropDownObject';
import VegCode from '../types/VegetationCodeType';

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

const getVegCodes = () => {
  const url = ApiConfig.vegetationCode;
  return api.get(url).then((res) => {
    let vegCodeOptions: Array<DropDownObj> = [];
    if (res.data) {
      const filteredData = res.data
        .filter((vegCode: VegCode) => codesToFilter.indexOf(vegCode.code) === -1);
      vegCodeOptions = getDropDownList(filteredData, true, true);
    }
    return vegCodeOptions;
  });
};

export default getVegCodes;
