import { getMultiOptList } from '../utils/MultiOptionsUtils';
import ApiConfig from './ApiConfig';
import api from './api';

const getMethodsOfPayment = () => {
  const url = ApiConfig.methodsOfPayment;
  return api.get(url).then((res) => getMultiOptList(res.data, true, false, true, ['isDefault']));
};

export default getMethodsOfPayment;
