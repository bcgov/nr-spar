import {
  BooleanInputType,
  OptionsInputType,
  StringArrInputType,
  StringInputType
} from '../../../types/FormInputType';
import MultiOptionsObj from '../../../types/MultiOptionsObject';

export type CollectionForm = {
  useDefaultAgencyInfo: BooleanInputType,
  collectorAgency: OptionsInputType,
  locationCode: StringInputType,
  startDate: StringInputType,
  endDate: StringInputType,
  numberOfContainers: StringInputType,
  volumePerContainers: StringInputType,
  volumeOfCones: StringInputType,
  selectedCollectionCodes: StringArrInputType,
  comments: StringInputType
}

export interface CollectionStepProps {
  defaultAgency: MultiOptionsObj,
  defaultCode: string,
  agencyOptions: Array<MultiOptionsObj>,
  readOnly?: boolean,
}
