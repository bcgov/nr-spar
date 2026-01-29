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
}
