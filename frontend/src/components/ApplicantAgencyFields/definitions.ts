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
  defaultAgency: MultiOptionsObj;
  defaultCode: string;
  setAgencyAndCode: Function;
  showCheckbox?: boolean;
  readOnly?: boolean;
}

export default ApplicantAgencyFieldsProps;
