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

export const deleteReplicate = (riaKey: number, replicateNumber: number) => {
  const url = `${ApiConfig.moistureContent}/${riaKey}/${replicateNumber}`;
  return api.delete(url);
};

export const deleteReplicates = (riaKey: number, replicateNumbers: number[]) => {
  const url = `${ApiConfig.moistureContent}/${riaKey}/replicates`;
  return api.post(url, replicateNumbers);
};

export const updateActivityRecord = (riaKey: number, activityRecord: any) => {
  const url = `${ApiConfig.moistureContent}/${riaKey}`;
  return api.patch(url, activityRecord);
};

export const validateResult = (riaKey: string) => {
  const url = `${ApiConfig.moistureContent}/validate/${riaKey}`;
  return api.get(url);
};

export const acceptResult = (riaKey: string) => {
  const url = `${ApiConfig.moistureContent}/accept/${riaKey}`;
  return api.get(url);
};

export const calculateAverage = (riaKey: string, mcValues: number[]) => {
  const url = `${ApiConfig.moistureContent}/${riaKey}/calculate-average`;
  return api.post(url, mcValues);
};
