import { BooleanInputType, StringInputType, OptionsInputType } from '../FormInputType';

type ExtractionStorageForm = {
  extraction: {
    useTSC: BooleanInputType;
    agency: OptionsInputType;
    locationCode: StringInputType;
    startDate: StringInputType;
    endDate: StringInputType;
  },
  seedStorage: {
    useTSC: BooleanInputType;
    agency: OptionsInputType;
    locationCode: StringInputType;
    startDate: StringInputType;
    endDate: StringInputType;
  }
};

export default ExtractionStorageForm;
