import ApiConfig from '../ApiConfig';
import api from '../api';

import { ActivitySearchRequest } from '../../views/CONSEP/TestingActivities/TestSearch/definitions';
import { PaginatedTestingSearchResponseType } from '../../types/consep/TestingSearchResponseType';

export const searchTestingActivities = (
  filter: ActivitySearchRequest,
  page: number = 0,
  size: number = 20
) => {
  const url = `${ApiConfig.searchTestActivities}/search?page=${page}&size=${size}`;
  return api.post(url, filter).then((res): PaginatedTestingSearchResponseType => res.data);
};
