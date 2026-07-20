import { QueryObserverResult } from '@tanstack/react-query';
import InterimForm from '../../../components/SeedlotRegistrationSteps/InterimStep/definitions';
import { SingleOwnerForm } from '../../../components/SeedlotRegistrationSteps/OwnershipStep/definitions';
import { BClassCollectionForm } from '../../../components/SeedlotRegistrationSteps/BClassCollectionStep/definitions';
import ExtractionStorageForm from '../../../types/SeedlotTypes/ExtractionStorage';
import { MutationStatusType } from '../../../types/QueryStatusType';
import { SeedlotBClassProgressPayloadType } from '../../../types/SeedlotType';

export type BClassAllStepData = {
  collectionStep: BClassCollectionForm,
  ownershipStep: Array<SingleOwnerForm>,
  interimStep: InterimForm,
  extractionStorageStep: ExtractionStorageForm
};

export type BClassProgressStepStatus = {
  isComplete: boolean;
  isCurrent: boolean;
  isInvalid: boolean;
};

export type BClassProgressIndicatorConfig = {
  collection: BClassProgressStepStatus;
  ownership: BClassProgressStepStatus;
  interim: BClassProgressStepStatus;
  extraction: BClassProgressStepStatus;
};

export type BClassStepMap = {
  [key: number]: keyof BClassProgressIndicatorConfig;
};

export type FormDataSource = 'draft' | 'tables' | 'empty';

export type FormLoadState =
  | { status: 'loading' }
  | { status: 'ready'; source: FormDataSource; editable: boolean }
  | { status: 'error'; message: string };
