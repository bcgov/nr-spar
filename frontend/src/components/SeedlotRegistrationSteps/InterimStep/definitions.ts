import { BooleanInputType, StringInputType } from '../../../types/FormInputType';

type InterimForm = {
  useCollectorAgencyInfo: BooleanInputType,
  agencyName: StringInputType,
  locationCode: StringInputType,
  startDate: StringInputType,
  endDate: StringInputType,
  facilityType: StringInputType,
  facilityOtherType: StringInputType
}

export default InterimForm;
