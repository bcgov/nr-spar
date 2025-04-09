export type ReplicateType = {
  riaKey: number;
  replicateNumber: number;
  replicateAccInd: number;
  containerId?: string;
  containerWeight?: number;
  freshSeed?: number;
  containerAndDryWeight?: number;
  dryWeight?: number;
  replicateComment?: string;
  overrideReason?: string;
};

export type TestingActivityType = {
  testCompleteInd: number;
  sampleDesc: string;
  moistureStatus: string;
  moisturePct: number;
  acceptResult: number;
  requestId: string;
  seedlotNumber: string;
  activityType: string;
  testCategoryCode: string;
  riaComment: string;
  actualBeginDateTime: string;
  actualEndDateTime: string;
  replicatesList: ReplicateType[];
};
