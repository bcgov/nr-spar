/** Types for the CONSEP germination test result screen (issue #2514). */

/**
 * One replicate's abnormal seedling counts for one count day (issue #2606).
 * Field names mirror the API; the screen's column order and short labels live
 * in `GerminationContent/abnormalConstants`.
 */
export type ReplicateAbnormalType = {
  abnormalNumReverseEmbryo?: number;
  abnormalNumStuntedRadicle?: number;
  abnormalNumStuntedHypocotyl?: number;
  abnormalNumRotten?: number;
  abnormalNumThickenedHypocotyl?: number;
  abnormalNumThickenedRadicle?: number;
  abnormalNumTwisted?: number;
  abnormalNumMegametophyteCollar?: number;
  abnormalNumWeak?: number;
  abnormalNumOther?: number;
  abnormalNumPregermination?: number;
  /** Carried by the API shape but not an abnormality category; never summed. */
  totalSeeds?: number;
};

export type GermCountSlotType = {
  slotIndex: number; // 1-13
  dailyGermSkey?: number;
  countDt?: string; // 'YYYY-MM-DD'
  dayNoOfTest?: number;
  rep1NoSeedsGerm?: number;
  rep2NoSeedsGerm?: number;
  rep3NoSeedsGerm?: number;
  rep4NoSeedsGerm?: number;
  // Undefined means "no abnormals recorded for this day", which the backend
  // distinguishes from "recorded as zero": it only writes an abnormal row, and
  // only mints a DAILY_GERM_SKEY, for a day that carries them.
  rep1Abnormal?: ReplicateAbnormalType;
  rep2Abnormal?: ReplicateAbnormalType;
  rep3Abnormal?: ReplicateAbnormalType;
  rep4Abnormal?: ReplicateAbnormalType;
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
