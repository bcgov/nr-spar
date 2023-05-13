export type OrchardObj = {
  id: number,
  orchardId: string,
  orchardLabel: string
}

export type OrchardForm = {
  orchards: Array<OrchardObj>;
  femaleGametic: string;
  maleGametic: string;
  controlledCross: boolean;
  biotechProcess: boolean;
  noPollenContamination: boolean;
  breedingPercentage: string;
  pollenMethodology: boolean;
}
