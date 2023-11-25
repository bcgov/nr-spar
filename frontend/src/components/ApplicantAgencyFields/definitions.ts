import AgencyTextPropsType from '../../types/AgencyTextPropsType';
import { FormInputType } from '../../types/FormInputType';
import MultiOptionsObj from '../../types/MultiOptionsObject';

interface ApplicantAgencyFieldsProps {
  checkboxId: string
  agency: FormInputType & { value: MultiOptionsObj };
  locationCode: FormInputType & { value: string };
  fieldsProps: AgencyTextPropsType;
  agencyOptions: Array<MultiOptionsObj>;
  defaultAgency: MultiOptionsObj;
  defaultCode: string;
  setAgencyAndCode: Function;
  showCheckbox?: boolean;
  readOnly?: boolean;
}

export default ApplicantAgencyFieldsProps;
