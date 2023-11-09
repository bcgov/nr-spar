import AgencyTextPropsType from '../../types/AgencyTextPropsType';
import { FormInputType } from '../../types/FormInputType';
import MultiOptionsObj from '../../types/MultiOptionsObject';

interface ApplicantAgencyFieldsProps {
  useDefault: FormInputType & { value: boolean };
  agency: FormInputType & { value: MultiOptionsObj };
  locationCode: FormInputType & { value: string };
  fieldsProps: AgencyTextPropsType;
  agencyOptions: Array<MultiOptionsObj>;
  defaultAgency: MultiOptionsObj;
  defaultCode: string;
  setAllValues: Function;
  readOnly?: boolean;
}

export default ApplicantAgencyFieldsProps;
