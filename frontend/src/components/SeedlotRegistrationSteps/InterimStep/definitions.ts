import { FormInputType } from '../../../types/FormInputType';

export type InterimForm = {
  useCollectorAgencyInfo: FormInputType & { value: boolean },
  agencyName: FormInputType & { value: string },
  locationCode: FormInputType & { value: string },
  startDate: FormInputType & { value: string },
  endDate: FormInputType & { value: string },
  facilityType: FormInputType & { value: string },
}

export default InterimForm;
