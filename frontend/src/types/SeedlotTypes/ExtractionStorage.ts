import { BooleanInputType, StringInputType } from '../FormInputType';

type ExtractionStorageForm = {
  extraction: {
    useTSC: BooleanInputType,
    agency: StringInputType,
    locationCode: StringInputType,
    startDate: StringInputType,
    endDate: StringInputType
  },
  seedStorage: {
    useTSC: BooleanInputType,
    agency: StringInputType,
    locationCode: StringInputType,
    startDate: StringInputType,
    endDate: StringInputType
  }
};

export default ExtractionStorageForm;
