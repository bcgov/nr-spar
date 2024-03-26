import { BooleanInputType, OptionsInputType, StringInputType } from '../../../types/FormInputType';
import MultiOptionsObj from '../../../types/MultiOptionsObject';

// Not using the FormInputType here because it has the inputId field.
// It's not used as an element id, but rather as an position indicator.
// e.g. the first orchard will have an inputId of 0, the second will have 1.
export type OrchardObj = {
  inputId: number,
  selectedItem: MultiOptionsObj | null
  isInvalid: boolean
}

export type OrchardForm = {
  orchards: Array<OrchardObj>,
  femaleGametic: OptionsInputType,
  maleGametic: OptionsInputType,
  isControlledCross: BooleanInputType,
  hasBiotechProcess: BooleanInputType,
  hasPollenContamination: BooleanInputType,
  breedingPercentage: StringInputType,
  isRegional: BooleanInputType
}
