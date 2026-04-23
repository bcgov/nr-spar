import axios from 'axios';

import ApiConfig from '../ApiConfig';
import api from '../api';

export type SearchCriteriaResponse = {
  userId: string;
  pageId: string;
  criteriaJson: Record<string, unknown>;
  updateTimestamp: string;
  revisionCount: number;
};

export const getSearchCriteria = (pageId: string): Promise<SearchCriteriaResponse | null> => {
  const url = `${ApiConfig.searchCriteria}/${encodeURIComponent(pageId)}`;
  return api.get(url)
    .then((res: { data: SearchCriteriaResponse }) => res.data)
    .catch((err: unknown) => {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      throw err;
    });
};

export const setSearchCriteria = (
  pageId: string,
  criteriaJson: Record<string, unknown>
): Promise<SearchCriteriaResponse> => {
  const url = `${ApiConfig.searchCriteria}/${encodeURIComponent(pageId)}`;
  return api.put(url, { criteriaJson })
    .then((res: { data: SearchCriteriaResponse }) => res.data);
};
