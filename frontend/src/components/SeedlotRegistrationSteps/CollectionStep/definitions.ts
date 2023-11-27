import {
  BooleanInputType,
  OptionsInputType,
  StringArrInputType,
  StringInputType
} from '../../../types/FormInputType';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { FormInvalidationObj } from '../../../views/Seedlot/SeedlotRegistrationForm/definitions';

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
  state: CollectionForm,
  setStepData: Function,
  defaultAgency: MultiOptionsObj,
  defaultCode: string,
  agencyOptions: Array<MultiOptionsObj>,
  collectionMethods: Array<MultiOptionsObj>,
  readOnly?: boolean,
  invalidateObj?: FormInvalidationObj
}

export type FormValidation = {
  isNameInvalid: boolean,
  isLocationCodeInvalid: boolean,
  isStartDateInvalid: boolean,
  isEndDateInvalid: boolean,
  isNumberOfContainersInvalid: boolean,
  isVolumePerContainersInvalid: boolean,
  isVolumeOfConesInvalid: boolean,
  isCollectionMethodsInvalid: boolean,
}
