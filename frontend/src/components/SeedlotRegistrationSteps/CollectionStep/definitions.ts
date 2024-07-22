import {
  BooleanInputType,
  StringArrInputType,
  StringInputType
} from '../../../types/FormInputType';

export type CollectionForm = {
  useDefaultAgencyInfo: BooleanInputType,
  collectorAgency: StringInputType,
  locationCode: StringInputType,
  startDate: StringInputType,
  endDate: StringInputType,
  numberOfContainers: StringInputType,
  volumePerContainers: StringInputType,
  volumeOfCones: StringInputType,
  selectedCollectionCodes: StringArrInputType,
  comments: StringInputType
}
