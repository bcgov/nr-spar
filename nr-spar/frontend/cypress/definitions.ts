export type SeedlotRegType = {
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
