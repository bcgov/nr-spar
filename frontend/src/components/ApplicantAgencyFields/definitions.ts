import AgencyTextPropsType from '../../types/AgencyTextPropsType';
import { BooleanInputType, OptionsInputType, StringInputType } from '../../types/FormInputType';
import MultiOptionsObj from '../../types/MultiOptionsObject';

interface ApplicantAgencyFieldsProps {
  checkboxId: string;
  isDefault: BooleanInputType;
  clientNumberInput: StringInputType;
  locationCode: StringInputType;
  fieldsProps: AgencyTextPropsType;
  setAgencyAndCode: (
    isDefault: BooleanInputType,
    agency: StringInputType,
    locationCode: StringInputType
    ) => void
  defaultAgency?: MultiOptionsObj;
  defaultCode?: string;
  showCheckbox?: boolean;
  readOnly?: boolean;
  maxInputColSize?: number;
  isFormSubmitted?: boolean;
}

export default ApplicantAgencyFieldsProps;
