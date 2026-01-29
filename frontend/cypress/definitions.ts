export type SeedlotRegType = {
  agencyAcronym: string,
  agencyName: string,
  agencyNumber: string,
  email: string,
  species: string,
  source: 'tpt' | 'upt' | 'cus',
  toBeRegistered: boolean,
  withinBc: boolean
};

export type SeedlotRegFixtureType = {
  [species: string]: SeedlotRegType
};

export type MoistureContentType = {
  mc: {
    title: string,
    commentPlaceholder: string,
    testComment: string
  },
  table: {
    title: string,
    column1: string,
    column2: string,
    column3: string,
    column4: string,
    column5: string,
    column6: string,
    column7: string,
    containerErrorMsg: string,
    containerWeightErrorMsg: string,
    checkedBox: string,
    unCheckedBox: string,
    emptyTableMsg: string
  }
};

export type ReplicateType = {
  riaKey: number;
  replicateNumber: number;
  containerId?: string;
  containerWeight?: number;
  freshSeed?: number;
  containerAndDryWeight?: number;
  dryWeight?: number;
  replicateAccInd?: number;
  replicateComment?: string;
  overrideReason?: string;
};

export type SeedlotReplicateInfoType = {
  testCompleteInd: number,
  sampleDesc: string,
  moistureStatus: string,
  moisturePct: number,
  acceptResult: number,
  requestId: string,
  seedlotNumber: string,
  familyLotNumber: string,
  geneticClassCode: string,
  vegetationCode: string,
  activityType: string,
  testCategoryCode: string,
  riaComment: string,
  actualBeginDateTime: string,
  actualEndDateTime: string,
  standardActivityType: string,
  replicatesList: ReplicateType[]
};
