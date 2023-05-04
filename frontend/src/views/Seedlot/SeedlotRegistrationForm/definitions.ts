import { CollectionForm } from '../../../components/SeedlotRegistrationSteps/CollectionStep/utils';
import InterimForm from '../../../components/SeedlotRegistrationSteps/InterimStep/definitions';
import { SingleOwnerForm } from '../../../components/SeedlotRegistrationSteps/OwnershipStep/definitions';
import ExtractionStorage from '../../../types/SeedlotTypes/ExtractionStorage';
import { SeedlotOrchard } from '../../../types/SeedlotTypes/SeedlotOrchard';

export type AllStepData = {
  collectionStep: CollectionForm,
  interimStep: InterimForm,
  ownershipStep: Array<SingleOwnerForm>,
  orchardStep: SeedlotOrchard,
  extractionStorageStep: ExtractionStorage
}
