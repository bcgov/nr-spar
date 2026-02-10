import ApiConfig from '../ApiConfig';
import api from '../api';

import { TestCodeType, ActivityIdType, ActivityRiaSkeyType } from '../../types/consep/TestingSearchType';

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

export const getActivityIds = (params?: { isFamilyLot?: boolean; isSeedlot?: boolean }) => {
  const url = `${ApiConfig.activities}/ids`;
  return api.get(url, { params }).then((res: { data: ActivityIdType[] }) => res.data);
};

export const getActivityDurationUnits = () => {
  const url = `${ApiConfig.testCodes}/activity-duration-units`;
  return api.get(url).then((res: { data: string[] }) => res.data);
};
