import AgencyTextPropsType from '../../types/AgencyTextPropsType';
import { BooleanInputType, OptionsInputType, StringInputType } from '../../types/FormInputType';
import MultiOptionsObj from '../../types/MultiOptionsObject';

interface ApplicantAgencyFieldsProps {
  checkboxId: string;
  isDefault: BooleanInputType;
  agency: OptionsInputType;
  locationCode: StringInputType;
  fieldsProps: AgencyTextPropsType;
  agencyOptions: Array<MultiOptionsObj>;
  setAgencyAndCode: Function;
  defaultAgency?: MultiOptionsObj;
  defaultCode?: string;
  showCheckbox?: boolean;
  readOnly?: boolean;
  maxInputColSize?: number;
  isFormSubmitted?: boolean;
}

export default ApplicantAgencyFieldsProps;
