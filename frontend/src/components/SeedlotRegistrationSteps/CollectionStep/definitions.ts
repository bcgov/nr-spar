import DropDownObj from '../../../types/DropDownObject';
import { FormInvalidationObj } from '../../../views/Seedlot/SeedlotRegistrationForm/definitions';

export interface CollectionForm {
  [method: string]: boolean | string,
  collectorAgency: string,
  locationCode: string,
  startDate: string,
  endDate: string,
  numberOfContainers: string,
  volumePerContainers: string,
  volumeOfCones: string,
  collectionMethodName: string,
  comments: string,
}

export interface CollectionStepProps {
  state: CollectionForm,
  setStepData: Function,
  defaultAgency: string,
  defaultCode: string,
  agencyOptions: Array<string>,
  // DropDownObj already fill every need for this field,
  // even if not being used in a dropdown component
  collectionMethods: Array<DropDownObj>,
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
