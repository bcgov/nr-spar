import ClientAndCodeInputTextType from '../../types/ClientAndCodeInputTextType';
import { StringInputType } from '../../types/FormInputType';

type ClientAndCodeInputProps = {
  checkboxId: string,
  // User types in an acronym, but the value is stored as client_number
  locationCodeInput: StringInputType,
  clientInput: StringInputType,
  textConfig: ClientAndCodeInputTextType,
  setClientAndCode: (
    clientInput: StringInputType,
    locationCodeInput: StringInputType
    ) => void
  defaultClientNumber?: string,
  defaultLocCode?: string,
  showCheckbox?: boolean,
  readOnly?: boolean,
  maxInputColSize?: number
}

export default ClientAndCodeInputProps;
