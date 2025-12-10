export type ActivitySearchRequest = {
  lotNumbers?: string[];
  testType?: string;
  activityId?: string;
  germinatorTrayId?: number;
  seedWithdrawalStartDate?: string;
  seedWithdrawalEndDate?: string;
  includeHistoricalTests?: boolean;
  germTestsOnly?: boolean;
  requestId?: string;
  requestType?: string;
  requestYear?: number;
  orchardId?: string;
  testCategoryCd?: string;
  testRank?: string;
  species?: string;
  actualBeginDateFrom?: string;
  actualBeginDateTo?: string;
  actualEndDateFrom?: string;
  actualEndDateTo?: string;
  revisedStartDateFrom?: string;
  revisedStartDateTo?: string;
  revisedEndDateFrom?: string;
  revisedEndDateTo?: string;
  germTrayAssignment?: number;
  completeStatus?: number;
  acceptanceStatus?: number;
  seedlotClass?: 'A' | 'B';
};

export type ValidationErrorType = {
  error: boolean;
  errorMessage: string;
}

export type ActivitySearchValidation = {
  lotNumbers: ValidationErrorType;
  germinatorTray: ValidationErrorType;
  requestId: ValidationErrorType;
  requestYear: ValidationErrorType;
  orchardId: ValidationErrorType;
};

export type Sorting = {
  id: string;
  desc: boolean;
};
