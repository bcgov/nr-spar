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
  geneticClassCode: string;
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
} & PaginationInfoType;

export type TestCodeType = {
  code: string;
  description: string;
};
