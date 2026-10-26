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

export type AClassRegFormFixtureType = {
  collector: {
    agencyTitle: string;
    agencySubtitle: string;
    informationTitle: string;
    informationSubtitle: string;
    checkboxText: string;
    acronymErrorMsg: string;
    locationErrorMsg: string;
    invalidDateErrorMsg: string;
    numOfContainerErrorMsg: string;
    volOfConesErrorMsg: string;
  };
  interimStorage: {
    title: string;
    subtitle: string;
    acronymErrorMsg: string;
    locationErrorMsg: string;
    invalidDateErrorMsg: string;
  };
  ownership: {
    title: string;
    subtitle: string;
    accordionTitle: string;
    accordionSubtitle: string;
    ownerAgencyError: string;
    ownerAgencyValidationError: string;
    locationCodeError: string;
    ownerPortionSumError: string;
    ownerPortionAboveLimitError: string;
    ownerPortionBelowLimitError: string;
    ownerPortionDecimalError: string;
    reservedAboveLimitError: string;
    reservedBelowLimitError: string;
    reservedDecimalError: string;
  };
  extraction: {
    extrationTitle: string;
    extrationSubtitle: string;
    storageTitle: string;
    storageSubtitle: string;
    extractionCheckboxText: string;
    storageCheckboxText: string;
    agencyErrorMsg: string;
    agencyValidationMsg: string;
    locationErrorMsg: string;
    invalidDateErrorMsg: string;
  };
};

export type MoistureContentType = {
  mc: {
    title: string,
    commentPlaceholder: string,
    testComment: string,
    invalidDateErrorMsg: string
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

export type PurityContentType = {
  pc: {
    title: string,
    commentPlaceholder: string,
    testComment: string,
    invalidDateErrorMsg: string,
    impurityBtn: string,
    maxImpuritiesErrorMsg: string
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
    checkedBox: string,
    unCheckedBox: string,
    emptyTableMsg: string
  }
};

export type FavouriteActivitiesType = {
  fa: {
    title: string;
    subtitle: string;
    favouriteActivitiesBtn: string;
  };
  table: Record<string, string>;
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
  sampleDesc: string | null,
  moistureStatus: string | null,
  moisturePct: number,
  acceptResult: number,
  requestId: string,
  seedlotNumber: string,
  familyLotNumber: string | null,
  geneticClassCode: string,
  vegetationCode: string,
  activityType: string,
  testCategoryCode: string,
  riaComment: string | null,
  actualBeginDateTime: string,
  actualEndDateTime: string,
  standardActivityType: string,
  replicatesList: ReplicateType[]
};
