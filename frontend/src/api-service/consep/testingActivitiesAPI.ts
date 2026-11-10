import ApiConfig from '../ApiConfig';
import api from '../api';
import { ActivityRecordType, ReplicateType, TestingTypes } from '../../types/consep/TestingActivityType';

type TestingParams = Record<string, any>;

type TestingActivitiesApiType =
  | 'getDataByRiaKey'
  | 'autosave'
  | 'deleteSingleReplicate'
  | 'deleteMultipleReplicates'
  | 'validateTestResult'
  | 'acceptResult';

const testingActivitiesAPI = async (
  testType: TestingTypes,
  fn: TestingActivitiesApiType,
  params: TestingParams
): Promise<any> => {
  let url = '';

  switch (testType) {
    case 'moistureTest':
      url = ApiConfig.moistureContent;
      break;
    case 'purityTest':
      url = ApiConfig.purityTest;
      break;
    default:
      throw new Error('Invalid test type');
  }

  const testingApiFn: Record<TestingActivitiesApiType, (...args: any[]) => Promise<any>> = {
    getDataByRiaKey: (riaKey: string) => api.get(`${url}/${riaKey}`).then((res) => res.data),
    // One PUT for the activity record and the replicates, locked on activity.updateTimestamp
    autosave: (
      riaKey: string,
      payload: { activity: ActivityRecordType, replicates: ReplicateType[] }
    ) => api.put(`${url}/${riaKey}`, payload),
    deleteSingleReplicate: (riaKey: string, replicateNumber: number) => api.delete(`${url}/${riaKey}/${replicateNumber}`),
    deleteMultipleReplicates: (riaKey: string, replicateNumbers: number[]) => api.delete(`${url}/${riaKey}/replicates?ids=${replicateNumbers.join(',')}`),
    validateTestResult: (riaKey: string) => api.get(`${url}/validate/${riaKey}`),
    acceptResult: (riaKey: string) => api.get(`${url}/accept/${riaKey}`)
  };

  const calledFn = testingApiFn[fn];

  return calledFn(...Object.values(params));
};

export default testingActivitiesAPI;
