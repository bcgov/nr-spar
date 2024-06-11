import { OptionsInputType } from '../../../types/FormInputType';
import MultiOptionsObj from '../../../types/MultiOptionsObject';

export type AdditionalSpzItemProps = {
  spz: OptionsInputType
  dropDownItems: MultiOptionsObj[],
  isFetching?: boolean,
  setAdditionalSpz: (oldSpz: OptionsInputType, newSpz: MultiOptionsObj) => void,
  deleteAdditionalSpz: (optionInputId: string) => void
}
