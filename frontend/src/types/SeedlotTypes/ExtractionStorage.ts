import { BooleanInputType, StringInputType, OptionsInputType } from '../FormInputType';

type ExtractionStorageForm = {
  extractionUseTSC: BooleanInputType;
  extractionAgency: OptionsInputType;
  extractionLocationCode: StringInputType;
  extractionStartDate: StringInputType;
  extractionEndDate: StringInputType;
  seedStorageUseTSC: BooleanInputType;
  seedStorageAgency: OptionsInputType;
  seedStorageLocationCode: StringInputType;
  seedStorageStartDate: StringInputType;
  seedStorageEndDate: StringInputType;
};

export default ExtractionStorageForm;
