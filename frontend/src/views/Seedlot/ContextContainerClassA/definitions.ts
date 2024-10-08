import { QueryObserverResult } from '@tanstack/react-query';
import { CollectionForm } from '../../../components/SeedlotRegistrationSteps/CollectionStep/definitions';
import InterimForm from '../../../components/SeedlotRegistrationSteps/InterimStep/definitions';
import { SingleOwnerForm } from '../../../components/SeedlotRegistrationSteps/OwnershipStep/definitions';
import ExtractionStorageForm from '../../../types/SeedlotTypes/ExtractionStorage';
import { OrchardForm } from '../../../components/SeedlotRegistrationSteps/OrchardStep/definitions';
import { RowDataDictType, NotifCtrlType } from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/definitions';
import { MutationStatusType } from '../../../types/QueryStatusType';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import { OptionsInputType, StringInputType } from '../../../types/FormInputType';
import { SeedlotProgressPayloadType } from '../../../types/SeedlotType';
import { ParentTreeByVegCodeResType } from '../../../types/ParentTreeTypes';

export type ParentTreeStepDataObj = {
  tableRowData: RowDataDictType, // table row data used in Cone & Pollen and the SMP Success tabs
  allParentTreeData: ParentTreeByVegCodeResType, // Contains all parent tree numbers under a species
  mixTabData: RowDataDictType, // table row data used exclusively for SMP mix tab
  notifCtrl: NotifCtrlType
}

export type AllStepData = {
  collectionStep: CollectionForm,
  ownershipStep: Array<SingleOwnerForm>,
  interimStep: InterimForm,
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
  reloadFormDraft: () => Promise<QueryObserverResult<SeedlotProgressPayloadType, unknown>>
}

export type RegFormProps = {
  cleanParentTables: Function
};

export type ClientAgenciesByCode = {
  [key: string]: MultiOptionsObj
};

export type AreaOfUseDataType = {
  primarySpz: OptionsInputType,
  additionalSpzList: OptionsInputType[],
  minElevation: StringInputType,
  maxElevation: StringInputType,
  minLatDeg: StringInputType,
  maxLatDeg: StringInputType,
  minLatMinute: StringInputType,
  maxLatMinute: StringInputType,
  minLatSec: StringInputType,
  maxLatSec: StringInputType,
  minLongDeg: StringInputType,
  maxLongDeg: StringInputType,
  minLongMinute: StringInputType,
  maxLongMinute: StringInputType,
  minLongSec: StringInputType,
  maxLongSec: StringInputType,
  comment: StringInputType
};
