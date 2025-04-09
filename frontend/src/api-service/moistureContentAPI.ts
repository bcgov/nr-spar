import ApiConfig from './ApiConfig';
import api from './api';
import { ReplicateType } from '../types/consep/TestingActivityType';

export const getMccByRiaKey = (riaKey: string) => {
  const url = `${ApiConfig.moistureContent}/${riaKey}`;
  return api.get(url).then((res) => res.data);
};

export const updateReplicates = (riaKey: number, replicates: ReplicateType[]) => {
  const url = `${ApiConfig.moistureContent}/replicate/${riaKey}`;
  return api.patch(url, replicates);
};
