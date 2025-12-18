import ApiConfig from '../ApiConfig';
import api from '../api';

import { TestCodeType } from '../../types/consep/TestingSearchType';

export const getTestTypeCodes = () => {
  const url = `${ApiConfig.testCodes}/type`;
  return api.get(url).then((res): TestCodeType[] => res.data);
};

export const getTestCategoryCodes = () => {
  const url = `${ApiConfig.testCodes}/category`;
  return api.get(url).then((res): TestCodeType[] => res.data);
};

export const getCodesByActivity = (activity: string) => {
  const url = `${ApiConfig.testCodes}/by-activity?activity=${encodeURIComponent(activity)}`;
  return api.get(url).then((res): string[] => res.data);
};
