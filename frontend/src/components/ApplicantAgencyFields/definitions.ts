import AgencyTextPropsType from '../../types/AgencyTextPropsType';
import { FormInputType } from '../../types/FormInputType';
import MultiOptionsObj from '../../types/MultiOptionsObject';

interface ApplicantAgencyFieldsProps {
  useDefault: FormInputType & { value: boolean };
  agency: FormInputType & { value: string };
  locationCode: FormInputType & { value: string };
  fieldsProps: AgencyTextPropsType;
  agencyOptions: Array<MultiOptionsObj>;
  defaultAgency: string;
  defaultCode: string;
  setAllValues: Function;
  showDefaultCheckbox?: boolean;
  inputsColSize?: number;
  readOnly?: boolean;
}

export default ApplicantAgencyFieldsProps;
