import { FormInputType } from '../../types/FormInputType';

interface ApplicantAgencyFieldsProps {
  useDefault: FormInputType & { value: boolean };
  agency: FormInputType & { value: string };
  locationCode: FormInputType & { value: string };
  fieldsTexts: any;
  agencyOptions: string[];
  defaultAgency: string;
  defaultCode: string;
  setAllValues: Function;
  readOnly?: boolean;
}

export default ApplicantAgencyFieldsProps;
