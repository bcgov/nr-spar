export type TestingTypes = 'moistureTest' | 'purityTest';

type DefaultReplicateFieldsType = {
  riaKey: number;
  replicateNumber: number;
  replicateAccInd: number;
  overrideReason?: string;
}

export type PurityReplicateType = DefaultReplicateFieldsType &
{
  pureSeedWeight?: number;
  otherSeedWeight?: number;
  inertMttrWeight?: number;
};

export type MccReplicateType = DefaultReplicateFieldsType &
{
  containerId?: string;
  containerWeight?: number;
  freshSeed?: number;
  containerAndDryWeight?: number;
  dryWeight?: number;
  mcValue?: number;
  replicateComment?: string;
};

export type ReplicateType = PurityReplicateType | MccReplicateType;

export type ReplicateKeys = keyof PurityReplicateType | keyof MccReplicateType;

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
  familyLotNumber: string;
  geneticClassCode: string;
  vegetationCode: string;
  activityType: string;
  replicatesList: ReplicateType[];
};

export type ActivitySummaryType = {
  activity: string;
  seedlotNumber: string;
  familyLotNumber: string;
  requestId: string;
  speciesAndClass: string;
  testResult: string;
}
