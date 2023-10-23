import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { FormInputType, FormInvalidationObj } from '../../../views/Seedlot/SeedlotRegistrationForm/definitions';

export type CollectionForm = {
  useDefaultAgencyInfo: FormInputType & {
    value: boolean
  },
  collectorAgency: FormInputType & { value: string },
  locationCode: FormInputType & { value: string },
  startDate: FormInputType & { value: string },
  endDate: FormInputType & { value: string },
  numberOfContainers: FormInputType & { value: string },
  volumePerContainers: FormInputType & { value: string },
  volumeOfCones: FormInputType & { value: string },
  selectedCollectionCodes: FormInputType & { value: string[] },
  comments: FormInputType & { value: string }
}

export interface CollectionStepProps {
  state: CollectionForm,
  setStepData: Function,
  defaultAgency: string,
  defaultCode: string,
  agencyOptions: Array<string>,
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
