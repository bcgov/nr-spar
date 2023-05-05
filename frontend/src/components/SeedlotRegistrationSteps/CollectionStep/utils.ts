import { FormInvalidationObj } from '../../../views/Seedlot/SeedlotRegistrationForm/definitions';

export interface CollectionForm {
  collectorAgency: string,
  locationCode: string,
  startDate: string,
  endDate: string,
  numberOfContainers: string,
  volumePerContainers: string,
  volumeOfCones: string,
  aerialRanking: boolean,
  aerialClippingTopping: boolean,
  felledTrees: boolean,
  climbing: boolean,
  squirrelCache: boolean,
  ground: boolean,
  squirrelHarvesting: boolean,
  other: boolean,
  collectionMethodName: string,
  comments: string,
}
export interface CollectionStepProps {
  state: CollectionForm,
  setStepData: Function,
  defaultAgency: string,
  defaultCode: string,
  agencyOptions: Array<string>,
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
