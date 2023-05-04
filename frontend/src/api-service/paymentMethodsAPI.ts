import ApiConfig from './ApiConfig';
import api from './api';

const getPaymentMethods = () => {
  const url = ApiConfig.paymentMethod;
  return api.get(url).then((res) => res.data);
};

export default getPaymentMethods;
