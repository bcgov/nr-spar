import ApiConfig from '../ApiConfig';
import api from '../api';

import { ActivitySearchRequest } from '../../views/CONSEP/TestingActivities/TestSearch/definitions';
import { PaginatedTestingSearchResponseType, TestCodeType } from '../../types/consep/TestingSearchType';

export const searchTestingActivities = (
  filter: ActivitySearchRequest,
  page: number = 0,
  size: number = 20
) => {
  const url = `${ApiConfig.searchTestActivities}/search?page=${page}&size=${size}`;
  return api.post(url, filter).then((res): PaginatedTestingSearchResponseType => res.data);
};

export const getTestTypeCodes = () => {
  const url = `${ApiConfig.searchTestActivities}/type-codes`;
  return api.get(url).then((res): TestCodeType[] => res.data);
};

export const getTestCategoryCodes = () => {
  const url = `${ApiConfig.searchTestActivities}/category-codes`;
  return api.get(url).then((res): TestCodeType[] => res.data);
};
