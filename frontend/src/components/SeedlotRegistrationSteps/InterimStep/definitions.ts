import { BooleanInputType, OptionsInputType, StringInputType } from '../../../types/FormInputType';

type InterimForm = {
  useCollectorAgencyInfo: BooleanInputType,
  agencyName: OptionsInputType,
  locationCode: StringInputType,
  startDate: StringInputType,
  endDate: StringInputType,
  facilityType: StringInputType,
  facilityOtherType: StringInputType
}

export default InterimForm;
