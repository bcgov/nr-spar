/** Types for the CONSEP germination test result screen (issue #2514). */

export type GermCountSlotType = {
  slotIndex: number; // 1-13
  dailyGermSkey?: number;
  countDt?: string; // 'YYYY-MM-DD'
  dayNoOfTest?: number;
  rep1NoSeedsGerm?: number;
  rep2NoSeedsGerm?: number;
  rep3NoSeedsGerm?: number;
  rep4NoSeedsGerm?: number;
  cumulativeGerm?: number;
};

export type GermReplicateType = {
  replicateNumber: number; // 1-4
  totalNoSeeds?: number;
  repAcceptedInd?: number; // 1 | 0
  tolrncOvrrdeDesc?: string | null; // 'ok' | null
};

export type GermCountDataType = {
  riaSkey: number;
  slots: GermCountSlotType[];
  updateTimestamp?: string;
};

export type GerminationTestHeaderType = {
  riaSkey: number;
  activityTypeCd: string;
  actualBeginDtTm?: string;
  actualEndDtTm?: string;
  testCategoryCd?: string;
  acceptResultInd?: number;
  testCompleteInd?: number;
  riaComment?: string;
  testRank?: string;
  germinationPct?: number;
  germinationValue?: number;
  peakValueGrmPct?: number;
  peakValueNoDays?: number;
  seedWithdrawalDate?: string;
  germinatorEntry?: string; // 'YYYY-MM-DD'
  germinatorTrayId?: number;
  germinatorId?: string;
  testResultUpdateTimestamp?: string;
  riaUpdateTimestamp?: string;
  requestId?: string;
  seedlotNumber?: string;
  familyLotNumber?: string;
  vegetationState?: string;
};

export type GermCountUpsertPayload = {
  updateTimestamp?: string;
  days: Array<Omit<GermCountSlotType, 'dailyGermSkey' | 'cumulativeGerm'>>;
  replicates: GermReplicateType[];
};
