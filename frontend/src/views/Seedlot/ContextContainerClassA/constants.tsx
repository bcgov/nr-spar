import React from 'react';

import { EmptyMultiOptObj, MINISTRY_OF_FOREST_ID } from '../../../shared-constants/shared-constants';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import {
  CollectionFormSubmitType, ExtractionFormSubmitType, InterimFormSubmitType, OrchardFormSubmitType,
  SingleOwnerFormSubmitType
} from '../../../types/SeedlotType';
import { getOptionsInputObj, getStringInputObj } from '../../../utils/FormInputUtils';
import { AreaOfUseDataType, ProgressIndicatorConfig, StepMap } from './definitions';

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
  code: MINISTRY_OF_FOREST_ID,
  label: `${MINISTRY_OF_FOREST_ID} - Tree Seed Centre - MOF`,
  description: 'Tree Seed Centre'
};

export const tscLocationCode = '00';

export const smartSaveText = {
  loading: 'Saving...',
  error: 'Save changes failed',
  idle: 'Save changes',
  reload: 'Reload form',
  success: 'Changes saved!',
  suggestion: 'Your recent changes could not be saved. Please try saving the form manually to keep all of your changes.',
  conflictTitle: 'Conflict detected',
  conflictSuggestion: (
    <div className="conflict-suggestion-div">
      Another user has updated this form. Please reload the page to view the latest information
      <br />
      <ul className="ul-disc">
        <li>Saving and submitting are temporarily disabled to prevent overwriting</li>
        <li>Reload the page to continue editing without losing further data</li>
        <li>Any unsaved changes will be lost</li>
      </ul>
    </div>
  )
};

export const emptyCollectionStep: CollectionFormSubmitType = {
  collectionClientNumber: '',
  collectionLocnCode: '',
  collectionStartDate: '',
  collectionEndDate: '',
  noOfContainers: '',
  volPerContainer: '',
  clctnVolume: '',
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
  primaryOrchardId: '',
  secondaryOrchardId: null,
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

export const initialAreaOfUseData: AreaOfUseDataType = {
  primarySpz: getOptionsInputObj('area-of-use-primary-spz', EmptyMultiOptObj),
  additionalSpzList: [],
  minElevation: getStringInputObj('area-of-use-min-elevation', ''),
  maxElevation: getStringInputObj('area-of-use-max-elevation', ''),
  minLatDeg: getStringInputObj('area-of-use-min-lat-deg', ''),
  maxLatDeg: getStringInputObj('area-of-use-max-lat-deg', ''),
  minLatMinute: getStringInputObj('area-of-use-min-lat-minute', ''),
  maxLatMinute: getStringInputObj('area-of-use-max-lat-minute', ''),
  minLatSec: getStringInputObj('area-of-use-min-lat-second', ''),
  maxLatSec: getStringInputObj('area-of-use-max-lat-second', ''),
  minLongDeg: getStringInputObj('area-of-use-min-long-deg', ''),
  maxLongDeg: getStringInputObj('area-of-use-max-long-deg', ''),
  minLongMinute: getStringInputObj('area-of-use-min-long-minute', ''),
  maxLongMinute: getStringInputObj('area-of-use-max-long-minute', ''),
  minLongSec: getStringInputObj('area-of-use-min-long-sec', ''),
  maxLongSec: getStringInputObj('area-of-use-max-long-sec', ''),
  comment: getStringInputObj('area-of-use-comment', '')
};
