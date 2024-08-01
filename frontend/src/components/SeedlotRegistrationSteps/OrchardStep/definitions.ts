import { BooleanInputType, OptionsInputType, StringInputType } from '../../../types/FormInputType';

export type OrchardForm = {
  orchards: {
    primaryOrchard: OptionsInputType,
    secondaryOrchard: OptionsInputType & { enabled: boolean }
  },
  femaleGametic: OptionsInputType,
  maleGametic: OptionsInputType,
  isControlledCross: BooleanInputType,
  hasBiotechProcess: BooleanInputType,
  hasPollenContamination: BooleanInputType,
  breedingPercentage: StringInputType,
  isRegional: BooleanInputType
}
