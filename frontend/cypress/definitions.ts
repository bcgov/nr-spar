export type SeedlotRegType = {
  agencyAcronym: string,
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
