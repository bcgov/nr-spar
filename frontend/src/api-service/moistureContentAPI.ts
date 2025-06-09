import ApiConfig from './ApiConfig';
import api from './api';

export const calculateAverage = (riaKey: string, mcValues: number[]) => {
  const url = `${ApiConfig.moistureContent}/${riaKey}/calculate-average`;
  return api.post(url, mcValues);
};
