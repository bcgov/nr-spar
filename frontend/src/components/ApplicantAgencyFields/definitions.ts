import AgencyTextPropsType from '../../types/AgencyTextPropsType';
import { OptionsInputType, StringInputType } from '../../types/FormInputType';
import MultiOptionsObj from '../../types/MultiOptionsObject';

interface ApplicantAgencyFieldsProps {
  checkboxId: string;
  isDefault: boolean;
  agency: OptionsInputType;
  locationCode: StringInputType;
  fieldsProps: AgencyTextPropsType;
  agencyOptions: Array<MultiOptionsObj>;
  setAgencyAndCode: Function;
  defaultAgency?: MultiOptionsObj;
  defaultCode?: string;
  showCheckbox?: boolean;
  readOnly?: boolean;
}

export default ApplicantAgencyFieldsProps;
