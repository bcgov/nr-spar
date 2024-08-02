import {
  StringArrInputType,
  StringInputType
} from '../../../types/FormInputType';

export type CollectionForm = {
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
