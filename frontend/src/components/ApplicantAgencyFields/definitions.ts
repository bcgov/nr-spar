import AgencyTextPropsType from '../../types/AgencyTextPropsType';
import { FormInputType } from '../../types/FormInputType';

interface ApplicantAgencyFieldsProps {
  useDefault: FormInputType & { value: boolean };
  agency: FormInputType & { value: string };
  locationCode: FormInputType & { value: string };
  fieldsProps: AgencyTextPropsType;
  agencyOptions: string[];
  defaultAgency: string;
  defaultCode: string;
  setAllValues: Function;
  readOnly?: boolean;
}

export default ApplicantAgencyFieldsProps;
