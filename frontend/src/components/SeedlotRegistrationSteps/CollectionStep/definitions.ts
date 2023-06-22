import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { FormInvalidationObj } from '../../../views/Seedlot/SeedlotRegistrationForm/definitions';

export interface CollectionForm {
  collectorAgency: string,
  locationCode: string,
  startDate: string,
  endDate: string,
  numberOfContainers: string,
  volumePerContainers: string,
  volumeOfCones: string,
  selectedCollectionCodes: string[],
  collectionMethodName: string,
  comments: string
}

export interface CollectionStepProps {
  state: CollectionForm,
  setStepData: Function,
  defaultAgency: string,
  defaultCode: string,
  agencyOptions: Array<string>,
  collectionMethods: Array<MultiOptionsObj>,
  readOnly?: boolean,
  invalidateObj?:FormInvalidationObj
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
