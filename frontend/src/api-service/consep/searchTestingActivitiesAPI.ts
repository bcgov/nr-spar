import axios from 'axios';

import ApiConfig from '../ApiConfig';
import api from '../api';

import { ActivitySearchRequest } from '../../views/CONSEP/TestingActivities/TestSearch/definitions';
import {
  PaginatedTestingSearchResponseType,
  TestingSearchResponseType
} from '../../types/consep/TestingSearchType';
import { PageResponse, SearchFilterGroup, SearchRequest } from '../../types/SearchTypes';
import { filterBuilder } from '../../utils/SearchFilterUtils';

const MAX_PAGE_SIZE = 100;

/** Trimmed, upper-cased, non-blank values. */
const upperList = (values?: string[]) => (values ?? [])
  .map((v) => v?.trim().toUpperCase())
  .filter((v): v is string => !!v);

/**
 * Translates the Testing Activities screen's form state into a standard search
 * filter. All screen-specific rules live here; the endpoint stays generic.
 */
export const toActivitySearchFilter = (form: ActivitySearchRequest): SearchFilterGroup => {
  const f = filterBuilder();

  f.inList('seedlotDisplay', upperList(form.lotNumbers));
  f.inList('activityTypeCd', upperList(form.testTypes));
  f.inList('activityId', form.activityIds);
  f.eq('germinatorTrayId', form.germinatorTrayId);

  // Request ID: first 11 characters are the request, the 12th (if any) is the item.
  const requestId = form.requestId?.trim();
  if (requestId) {
    f.eq('reqId', requestId.slice(0, 11));
    if (requestId.length >= 12) f.eq('itemId', requestId.charAt(11));
  }
  f.eq('requestTypeSt', form.requestType);
  f.eq('requestYr', form.requestYear);
  f.eq('orchardId', form.orchardId);
  f.eq('testCategoryCd', form.testCategoryCd);
  f.eq('testRank', form.testRank);
  f.eq('species', form.species);
  f.eq('geneticClassCode', form.seedlotClass);

  // Indicator filters: -1 = yes, 0 = no.
  f.eq('assignedTrayInd', form.germTrayAssignment);
  f.eq('testCompleteInd', form.completeStatus);
  f.eq('acceptResultInd', form.acceptanceStatus);

  // Historical tests are those with no request (request_skey = 0); hidden only when
  // the user explicitly unticks "include historical tests".
  if (form.includeHistoricalTests === false) f.ne('requestSkey', 0);
  if (form.germTestsOnly) f.eq('germTestInd', -1);
  // seedlotDisplay is matched case-insensitively by the server, so 'F' also finds 'f...'.
  if (form.familyLotsOnly) f.startsWith('seedlotDisplay', 'F');

  f.dateRange('seedWithdrawalDate', form.seedWithdrawalStartDate, form.seedWithdrawalEndDate);
  f.dateRange('actualBeginDtTm', form.actualBeginDateFrom, form.actualBeginDateTo);
  f.dateRange('actualEndDtTm', form.actualEndDateFrom, form.actualEndDateTo);
  f.dateRange('revisedStartDt', form.revisedStartDateFrom, form.revisedStartDateTo);
  f.dateRange('revisedEndDt', form.revisedEndDateFrom, form.revisedEndDateTo);

  return f.build();
};

const postSearch = (request: SearchRequest) => (
  api.post(`${ApiConfig.searchTestActivities}/search`, request)
    .then((res): PageResponse<TestingSearchResponseType> => res.data)
);

/**
 * The message to show for a failed search: the server's explanation (the
 * `detail` of a 400 problem response) when there is one.
 */
export const searchErrorMessage = (error: unknown): string | undefined => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string' && detail) return detail;
  }
  return error instanceof Error && error.message ? error.message : undefined;
};

/** Returns the lot numbers that have no testing activities. */
export const findMissingLotNumbers = (lotNumbers: string[]) => (
  api.post(`${ApiConfig.searchTestActivities}/missing-lot-numbers`, lotNumbers)
    .then((res): string[] => res.data)
);

/**
 * Searches testing activities through the standard search endpoint.
 *
 * Keeps the screen-facing signature and response shape. When `unpaged` is true
 * (CSV export) every match comes back in one response.
 */
export const searchTestingActivities = async (
  filter: ActivitySearchRequest,
  sortBy?: string,
  sortDirection: 'asc' | 'desc' = 'asc',
  unpaged: boolean = false,
  size: number = 20,
  page: number = 0
): Promise<PaginatedTestingSearchResponseType> => {
  const base: SearchRequest = {
    filter: toActivitySearchFilter(filter),
    sort: sortBy ? [{ field: sortBy, direction: sortDirection === 'desc' ? 'DESC' : 'ASC' }] : undefined
  };

  if (unpaged) {
    // Export: every match in one response (the server caps how many rows it allows).
    const all = await postSearch({ ...base, unpaged: true });
    return {
      content: all.content,
      totalElements: all.page.totalElements,
      totalPages: 1,
      pageNumber: 0,
      pageSize: all.content.length
    };
  }

  const lotNumbers = upperList(filter.lotNumbers);
  const [result, missingLotNumbers] = await Promise.all([
    postSearch({ ...base, page, size: Math.min(size, MAX_PAGE_SIZE) }),
    lotNumbers.length ? findMissingLotNumbers(lotNumbers) : Promise.resolve([])
  ]);

  return {
    content: result.content,
    totalElements: result.page.totalElements,
    totalPages: result.page.totalPages,
    pageNumber: result.page.number,
    pageSize: result.page.size,
    missingLotNumbers
  };
};
