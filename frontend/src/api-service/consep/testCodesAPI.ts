import ApiConfig from '../ApiConfig';
import api from '../api';

import { TestCodeType, ActivityIdType } from '../../types/consep/TestingSearchType';

export const getTestTypeCodes = () => {
  const url = `${ApiConfig.testCodes}/type`;
  return api.get(url).then((res: { data: TestCodeType[] }): TestCodeType[] => res.data);
};

export const getTestCategoryCodes = () => {
  const url = `${ApiConfig.testCodes}/category`;
  return api.get(url).then((res: { data: TestCodeType[] }): TestCodeType[] => res.data);
};

export const getCodesByActivity = (activity: string) => {
  const url = `${ApiConfig.testCodes}/by-activity?activity=${encodeURIComponent(activity)}`;
  return api.get(url).then((res): string[] => res.data);
};

export const getRequestTypes = () => {
  const url = `${ApiConfig.testCodes}/request-types`;
  return api.get(url).then((res: { data: TestCodeType[] }) => res.data);
};

export const getActivityIds = () => {
  const url = `${ApiConfig.activities}/ids`;
  return api.get(url).then((res: { data: ActivityIdType[] }) => res.data);
};
