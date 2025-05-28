export type ReplicateType = {
  riaKey: number;
  replicateNumber: number;
  replicateAccInd: number;
  containerId?: string;
  containerWeight?: number;
  freshSeed?: number;
  containerAndDryWeight?: number;
  dryWeight?: number;
  mcValue?: number;
  replicateComment?: string;
  overrideReason?: string;
};

export type ActivityRecordType = {
  testCategoryCode?: string;
  riaComment?: string;
  actualBeginDateTime?: string;
  actualEndDateTime?: string;
};

export type TestingActivityType = ActivityRecordType & {
  testCompleteInd: number;
  sampleDesc: string;
  moistureStatus: string;
  moisturePct: number;
  acceptResult: number;
  requestId: string;
  seedlotNumber: string;
  activityType: string;
  replicatesList: ReplicateType[];
};
