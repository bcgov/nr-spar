import ApiConfig from '../ApiConfig';
import api from '../api';

import { ActivitySearchRequest } from '../../views/CONSEP/TestingActivities/TestSearch/definitions';
import { PaginatedTestingSearchResponseType } from '../../types/consep/TestingSearchType';

export const searchTestingActivities = (
  filter: ActivitySearchRequest,
  sortBy?: string,
  sortDirection: 'asc' | 'desc' = 'asc',
  unpaged: boolean = false,
  size: number = 20,
  page: number = 0
) => {
  let url = `${ApiConfig.searchTestActivities}/search?page=${page}&size=${size}&unpaged=${unpaged}`;

  if (sortBy) {
    url += `&sortBy=${encodeURIComponent(sortBy)}&sortDirection=${sortDirection}`;
  }

  return api.post(url, filter)
    .then((res): PaginatedTestingSearchResponseType => res.data);
};
