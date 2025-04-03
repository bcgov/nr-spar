export type ReplicateType = {
  riaKey: number;
  replicateNumber: number;
  containerId: string;
  containerWeight: number;
  freshSeed: number;
  containerAndDryWeight: number;
  dryWeight: number;
  replicateAccInd: number;
  replicateComment: string;
  overrideReason: string;
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
