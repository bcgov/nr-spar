import { StringInputType } from '../../../types/FormInputType';
import MultiOptionsObj from '../../../types/MultiOptionsObject';

export type OrchardObj = {
  inputId: number,
  selectedItem: MultiOptionsObj | null
  isInvalid: boolean
}

export type OrchardForm = {
  orchards: Array<OrchardObj>,
  femaleGametic: StringInputType,
  maleGametic: StringInputType,
  controlledCross: boolean,
  biotechProcess: boolean,
  noPollenContamination: boolean,
  breedingPercentage: StringInputType,
  pollenMethodology: boolean
}
