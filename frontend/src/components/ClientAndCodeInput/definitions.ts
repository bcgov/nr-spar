import ClientAndCodeInputTextType from '../../types/ClientAndCodeInputTextType';
import { BooleanInputType, StringInputType } from '../../types/FormInputType';

type ClientAndCodeInputProps = {
  checkboxId: string,
  // User types in an acronym, but the value is stored as client_number
  locationCodeInput: StringInputType,
  clientInput: StringInputType,
  textConfig: ClientAndCodeInputTextType,
  setClientAndCode: (
    clientInput: StringInputType,
    locationCodeInput: StringInputType,
    checkBoxInput?: BooleanInputType
    ) => void
  defaultClientNumber?: string,
  defaultLocCode?: string,
  showCheckbox?: boolean,
  readOnly?: boolean,
  maxInputColSize?: number,
  checkBoxInput?: BooleanInputType
}

export default ClientAndCodeInputProps;
