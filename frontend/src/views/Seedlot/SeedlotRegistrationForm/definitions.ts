import { CollectionForm } from '../../../components/SeedlotRegistrationSteps/CollectionStep/definitions';
import InterimForm from '../../../components/SeedlotRegistrationSteps/InterimStep/definitions';
import { SingleOwnerForm } from '../../../components/SeedlotRegistrationSteps/OwnershipStep/definitions';
import ExtractionStorage from '../../../types/SeedlotTypes/ExtractionStorage';
import { OrchardForm } from '../../../components/SeedlotRegistrationSteps/OrchardStep/definitions';
import { RowDataDictType, NotifCtrlType } from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/definitions';

export type ParentTreeStepDataObj = {
  tableRowData: RowDataDictType,
  notifCtrl: NotifCtrlType
}

export type AllStepData = {
  collectionStep: CollectionForm,
  interimStep: InterimForm,
  ownershipStep: Array<SingleOwnerForm>,
  orchardStep: OrchardForm,
  parentTreeStep: ParentTreeStepDataObj,
  extractionStorageStep: ExtractionStorage
}

type SingleInvalidObj = {
  isInvalid: boolean,
  invalidText: string,
}

export type FormInvalidationObj = {
  [key: string]: SingleInvalidObj;
}

export type OwnershipInvalidObj = {
  [id: number]: FormInvalidationObj;
}

export type AllStepInvalidationObj = {
  collectionStep: FormInvalidationObj,
  interimStep: FormInvalidationObj,
  ownershipStep: OwnershipInvalidObj,
  orchardStep: FormInvalidationObj,
  extractionStorageStep: FormInvalidationObj
}
