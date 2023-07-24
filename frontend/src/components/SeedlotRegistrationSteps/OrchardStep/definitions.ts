import MultiOptionsObj from '../../../types/MultiOptionsObject';

export type OrchardObj = {
  inputId: number,
  selectedItem: MultiOptionsObj | null
}

export type OrchardForm = {
  orchards: Array<OrchardObj>,
  femaleGametic: string,
  maleGametic: string,
  controlledCross: boolean,
  biotechProcess: boolean,
  noPollenContamination: boolean,
  breedingPercentage: string,
  pollenMethodology: boolean
}
