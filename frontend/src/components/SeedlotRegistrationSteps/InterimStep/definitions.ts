import { FormInputType } from '../../../types/FormInputType';

type InterimForm = {
  useCollectorAgencyInfo: FormInputType & { value: boolean },
  agencyName: FormInputType & { value: string },
  locationCode: FormInputType & { value: string },
  startDate: FormInputType & { value: string },
  endDate: FormInputType & { value: string },
  facilityType: FormInputType & { value: string }
  facilityOtherType: FormInputType & { value: string }
}

export default InterimForm;
