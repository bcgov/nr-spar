import ApiConfig from './ApiConfig';
import api from './api';

const getMethodOfPayment = () => {
  const url = ApiConfig.methodOfPayment;
  return api.get(url).then((res) => res.data);
};

export default getMethodOfPayment;
