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
