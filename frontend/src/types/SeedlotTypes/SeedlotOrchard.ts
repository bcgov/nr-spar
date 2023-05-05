export type SeedlotOrchard = {
  orchardId: string;
  orchardName: string;
  additionalId: string;
  additionalName: string;
  femaleGametic: string;
  maleGametic: string;
  controlledCross: boolean;
  biotechProcess: boolean;
  noPollenContamination: boolean;
  breedingPercentage: string;
  pollenMethodology: boolean;
}

export type MockSeedlotOrchard = {
  [seedlotnumber: string]: SeedlotOrchard
}
