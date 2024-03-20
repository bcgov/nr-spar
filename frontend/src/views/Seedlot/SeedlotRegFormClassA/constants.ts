import MultiOptionsObj from '../../../types/MultiOptionsObject';
import {
  CollectionFormSubmitType, ExtractionFormSubmitType, InterimFormSubmitType, OrchardFormSubmitType,
  SingleOwnerFormSubmitType
} from '../../../types/SeedlotType';
import { ProgressIndicatorConfig, StepMap } from './definitions';

export const MAX_EDIT_BEFORE_SAVE = 5;

export const initialProgressConfig: ProgressIndicatorConfig = {
  collection: {
    isComplete: false,
    isCurrent: false,
    isInvalid: false
  },
  ownership: {
    isComplete: false,
    isCurrent: false,
    isInvalid: false
  },
  interim: {
    isComplete: false,
    isCurrent: false,
    isInvalid: false
  },
  orchard: {
    isComplete: false,
    isCurrent: false,
    isInvalid: false
  },
  parent: {
    isComplete: false,
    isCurrent: false,
    isInvalid: false
  },
  extraction: {
    isComplete: false,
    isCurrent: false,
    isInvalid: false
  }
};

export const completeProgressConfig: ProgressIndicatorConfig = {
  collection: {
    isComplete: true,
    isCurrent: false,
    isInvalid: false
  },
  ownership: {
    isComplete: true,
    isCurrent: false,
    isInvalid: false
  },
  interim: {
    isComplete: true,
    isCurrent: false,
    isInvalid: false
  },
  orchard: {
    isComplete: true,
    isCurrent: false,
    isInvalid: false
  },
  parent: {
    isComplete: true,
    isCurrent: false,
    isInvalid: false
  },
  extraction: {
    isComplete: true,
    isCurrent: false,
    isInvalid: false
  }
};

export const stepMap: StepMap = {
  0: 'collection',
  1: 'ownership',
  2: 'interim',
  3: 'orchard',
  4: 'parent',
  5: 'extraction'
};

export const tscAgencyObj: MultiOptionsObj = {
  code: '00012797',
  label: '00012797 - Tree Seed Centre - MOF',
  description: 'Tree Seed Centre'
};

export const tscLocationCode = '00';

export const smartSaveText = {
  loading: 'Saving...',
  error: 'Save changes failed',
  idle: 'Save changes',
  success: 'Changes saved!',
  suggestion: 'Your recent changes could not be saved. Please try saving the form manually to keep all of your changes.'
};

export const emptyCollectionStep: CollectionFormSubmitType = {
  collectionClientNumber: '',
  collectionLocnCode: '',
  collectionStartDate: '',
  collectionEndDate: '',
  noOfContainers: 1,
  volPerContainer: 1,
  clctnVolume: 1,
  seedlotComment: '',
  coneCollectionMethodCodes: []
};

export const emptyOwnershipStep: Array<SingleOwnerFormSubmitType> = [{
  ownerClientNumber: '',
  ownerLocnCode: '',
  originalPctOwned: 100.00,
  originalPctRsrvd: 100.00,
  originalPctSrpls: 0.00,
  methodOfPaymentCode: '',
  sparFundSrceCode: ''
}];

export const emptyInterimStep: InterimFormSubmitType = {
  intermStrgClientNumber: '',
  intermStrgLocnCode: '',
  intermStrgStDate: '',
  intermStrgEndDate: '',
  intermOtherFacilityDesc: '',
  intermFacilityCode: 'OCV'
};

export const emptyOrchardStep: OrchardFormSubmitType = {
  orchardsId: [],
  femaleGameticMthdCode: '',
  maleGameticMthdCode: '',
  controlledCrossInd: false,
  biotechProcessesInd: false,
  pollenContaminationInd: false,
  pollenContaminationPct: 0,
  contaminantPollenBv: 0,
  pollenContaminationMthdCode: 'REG'
};

export const emptyExtractionStep: ExtractionFormSubmitType = {
  extractoryClientNumber: '',
  extractoryLocnCode: '',
  extractionStDate: '',
  extractionEndDate: '',
  storageClientNumber: '',
  storageLocnCode: '',
  temporaryStrgStartDate: '',
  temporaryStrgEndDate: ''
};
