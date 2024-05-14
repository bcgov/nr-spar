import ApiConfig from './ApiConfig';
import api from './api';

const getMethodsOfPayment = () => {
  const url = ApiConfig.methodsOfPayment;
  return api.get(url).then((res) => res.data);
};

export default getMethodsOfPayment;
