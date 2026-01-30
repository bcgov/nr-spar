export type TestingSearchResponseType = {
  seedlotDisplay: string;
  requestItem: string;
  species: string;
  activityId: string;
  testRank: string | null;
  currentTestInd: number;
  testCategoryCd: string;
  germinationPct: number | null;
  pv: string;
  moisturePct: number | null;
  purityPct: number | null;
  seedsPerGram: number | null;
  otherTestResult: number | null;
  testCompleteInd: number;
  acceptResultInd: number;
  significntStsInd: number;
  seedWithdrawalDate: string | null;
  revisedEndDt: string | null;
  actualBeginDtTm: string | null;
  actualEndDtTm: string | null;
  riaComment: string | null;
  requestSkey: number;
  reqId: string;
  itemId: string;
  seedlotSample: string;
  riaSkey: number;
  activityTypeCd: string;
};

// Type for pagination details
export type PaginationInfoType = {
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
};

export type PaginatedTestingSearchResponseType = {
  content: TestingSearchResponseType[];
  missingLotNumbers?: string[];
} & PaginationInfoType;

export type TestCodeType = {
  code: string;
  description: string;
};

export type ActivityIdType = {
  standardActivityId: string;
  activityTypeCd: string;
  testCategoryCd: string;
  activityDescription: string;
};

export type ActivityRiaSkeyType = {
  riaSkey: number;
  activityDescription: string;
};

export type AddGermTestValidationResponseType = {
  germTest: boolean;
  matchesCurrentTypeCode: boolean;
  currentTypeCode: string | null;
};
