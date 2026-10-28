import { createContext } from 'react';

import { CollectionForm } from '../components/SeedlotRegistrationSteps/CollectionStep/definitions';
import InterimForm from '../components/SeedlotRegistrationSteps/InterimStep/definitions';
import { SingleOwnerForm } from '../components/SeedlotRegistrationSteps/OwnershipStep/definitions';
import ExtractionStorageForm from '../types/SeedlotTypes/ExtractionStorage';

export type SeedlotRegWizardStepData = {
  collectionStep: CollectionForm,
  ownershipStep: Array<SingleOwnerForm>,
  interimStep: InterimForm,
  extractionStorageStep: ExtractionStorageForm
};

export type SeedlotRegWizardContextType = {
  allStepData: SeedlotRegWizardStepData,
  setStepData: (stepName: keyof SeedlotRegWizardStepData, stepData: unknown) => void,
  defaultClientNumber: string,
  defaultCode: string,
  isFormSubmitted: boolean,
  seedlotNumber: string | undefined
};

const SeedlotRegWizardContext = createContext<SeedlotRegWizardContextType>({
  allStepData: {} as SeedlotRegWizardStepData,
  setStepData: () => { },
  defaultClientNumber: '',
  defaultCode: '',
  isFormSubmitted: false,
  seedlotNumber: undefined
});

export default SeedlotRegWizardContext;
