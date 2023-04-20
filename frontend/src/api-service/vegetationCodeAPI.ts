import ApiConfig from './ApiConfig';
import api from './api';
import { getDropDownList } from '../utils/DropDownUtils';
import DropDownObj from '../types/DropDownObject';

const getVegCodes = () => {
  const url = ApiConfig.vegetationCode;
  return api.get(url).then((res) => {
    let vegCodeOptions: Array<DropDownObj> = [];
    if (res.data) {
      vegCodeOptions = getDropDownList(res.data);
    }
    return vegCodeOptions;
  });
};

export default getVegCodes;
