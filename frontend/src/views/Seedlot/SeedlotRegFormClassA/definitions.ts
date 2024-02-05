import { CollectionForm } from '../../../components/SeedlotRegistrationSteps/CollectionStep/definitions';
import InterimForm from '../../../components/SeedlotRegistrationSteps/InterimStep/definitions';
import { SingleOwnerForm } from '../../../components/SeedlotRegistrationSteps/OwnershipStep/definitions';
import ExtractionStorageForm from '../../../types/SeedlotTypes/ExtractionStorage';
import { OrchardForm } from '../../../components/SeedlotRegistrationSteps/OrchardStep/definitions';
import { RowDataDictType, NotifCtrlType, AllParentTreeMap } from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/definitions';
import { MutationStatusType } from '../../../types/QueryStatusType';

export type ParentTreeStepDataObj = {
  tableRowData: RowDataDictType, // able row data used in Cone & Pollen and the SMP Success tabs
  allParentTreeData: AllParentTreeMap // Contains all parent tree numbers under a species
  mixTabData: RowDataDictType, // table row data used exclusively for SMP mix tab
  notifCtrl: NotifCtrlType
}

export type AllStepData = {
  collectionStep: CollectionForm,
  interimStep: InterimForm,
  ownershipStep: Array<SingleOwnerForm>,
  orchardStep: OrchardForm,
  parentTreeStep: ParentTreeStepDataObj,
  extractionStorageStep: ExtractionStorageForm
}

export type ProgressStepStatus = {
  isComplete: boolean;
  isCurrent: boolean;
  isInvalid: boolean;
}

export type ProgressIndicatorConfig = {
  collection: ProgressStepStatus;
  ownership: ProgressStepStatus;
  interim: ProgressStepStatus;
  orchard: ProgressStepStatus;
  parent: ProgressStepStatus;
  extraction: ProgressStepStatus;
}

export type StepMap = {
  [key: number]: keyof ProgressIndicatorConfig;
}

export type SaveTooltipProps = {
  saveStatus: string | null;
  saveDescription: string;
  mutationStatus: MutationStatusType;
  lastSaveTimestamp: string;
  handleSaveBtn: Function;
}

export type RegFormProps = {
  cleanParentTables: Function
};
