/* eslint-disable max-len */
import BigNumber from 'bignumber.js';
import { CollectionForm } from '../../../components/SeedlotRegistrationSteps/CollectionStep/definitions';
import InterimForm from '../../../components/SeedlotRegistrationSteps/InterimStep/definitions';
import { OrchardForm, OrchardObj } from '../../../components/SeedlotRegistrationSteps/OrchardStep/definitions';
import { createOwnerTemplate } from '../../../components/SeedlotRegistrationSteps/OwnershipStep/constants';
import { SingleOwnerForm } from '../../../components/SeedlotRegistrationSteps/OwnershipStep/definitions';
import { DEFAULT_MIX_PAGE_ROWS, MAX_DECIMAL_DIGITS, notificationCtrlObj } from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/constants';
import { RowDataDictType, RowItem } from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/definitions';
import {
  calcAverage, calcSum, generateDefaultRows,
  processOrchards
} from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/utils';
import { EmptyMultiOptObj } from '../../../shared-constants/shared-constants';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import ExtractionStorageForm from '../../../types/SeedlotTypes/ExtractionStorage';
import {
  CollectionFormSubmitType, ExtractionFormSubmitType, InterimFormSubmitType,
  OrchardFormSubmitType, ParentTreeFormSubmitType, SingleOwnerFormSubmitType
} from '../../../types/SeedlotType';
import { dateStringToISO } from '../../../utils/DateUtils';

import { stepMap } from './constants';
import {
  ParentTreeStepDataObj, ProgressIndicatorConfig
} from './definitions';

export const initProgressBar = (
  currentStep: number,
  initialProgressConfig: ProgressIndicatorConfig
): ProgressIndicatorConfig => {
  const progressConfig = structuredClone(initialProgressConfig);

  Object.keys(stepMap).forEach((key: string) => {
    const numKey = parseInt(key, 10);
    if (numKey === currentStep) {
      progressConfig[stepMap[numKey]].isCurrent = true;
    }
  });

  return progressConfig;
};

export const initCollectionState = (
  defaultAgency: MultiOptionsObj,
  defaultCode: string
) => ({
  useDefaultAgencyInfo: {
    id: 'collection-use-default-agency',
    value: true,
    isInvalid: false
  },
  collectorAgency: {
    id: 'collection-collector-agency',
    value: defaultAgency,
    isInvalid: false
  },
  locationCode: {
    id: 'collection-location-code',
    value: defaultCode,
    isInvalid: false
  },
  startDate: {
    id: 'collection-start-date',
    value: '',
    isInvalid: false
  },
  endDate: {
    id: 'collection-end-date',
    value: '',
    isInvalid: false
  },
  numberOfContainers: {
    id: 'collection-num-of-container',
    value: '1',
    isInvalid: false
  },
  volumePerContainers: {
    id: 'collection-vol-per-container',
    value: '1',
    isInvalid: false
  },
  volumeOfCones: {
    id: 'collection-vol-of-cones',
    value: '1',
    isInvalid: false
  },
  selectedCollectionCodes: {
    id: 'collection-selected-collection-code',
    value: [],
    isInvalid: false
  },
  comments: {
    id: 'collection-comments',
    value: '',
    isInvalid: false
  }
});

export const initOwnershipState = (
  defaultAgency: MultiOptionsObj,
  defaultCode: string
) => {
  const initialOwnerState = createOwnerTemplate(0);
  initialOwnerState.ownerAgency.value = defaultAgency;
  initialOwnerState.ownerCode.value = defaultCode;
  initialOwnerState.ownerPortion.value = '100';
  return initialOwnerState;
};

export const initInterimState = (
  defaultAgency: MultiOptionsObj,
  defaultCode: string
) => ({
  useCollectorAgencyInfo: {
    id: 'interim-use-collection-agency',
    value: true,
    isInvalid: false
  },
  agencyName: {
    id: 'interim-agency',
    value: defaultAgency,
    isInvalid: false
  },
  locationCode: {
    id: 'interim-location-code',
    value: defaultCode,
    isInvalid: false
  },
  startDate: {
    id: 'storage-start-date',
    value: '',
    isInvalid: false
  },
  endDate: {
    id: 'storage-end-date',
    value: '',
    isInvalid: false
  },
  facilityType: {
    id: 'storage-facility-type',
    value: 'OCV',
    isInvalid: false
  },
  facilityOtherType: {
    id: 'storage-other-type-input',
    value: '',
    isInvalid: false
  }
});

export const initOrchardState = (): OrchardForm => (
  {
    orchards: [
      {
        inputId: 0,
        selectedItem: null,
        isInvalid: false
      }
    ],
    femaleGametic: {
      id: 'orchard-female-gametic',
      value: EmptyMultiOptObj,
      isInvalid: false
    },
    maleGametic: {
      id: 'orchard-male-gametic',
      value: EmptyMultiOptObj,
      isInvalid: false
    },
    isControlledCross: {
      id: 'orchard-is-controlled-cross',
      value: false,
      isInvalid: false
    },
    hasBiotechProcess: {
      id: 'orchard-has-biotech-process',
      value: false,
      isInvalid: false
    },
    hasPollenContamination: {
      id: 'orchard-has-pollen-contamination',
      value: false,
      isInvalid: false
    },
    breedingPercentage: {
      id: 'orchard-breading-perc',
      value: '0',
      isInvalid: false
    },
    isRegional: {
      id: 'orchard-is-regional',
      value: true,
      isInvalid: false
    }
  }
);

export const initParentTreeState = (): ParentTreeStepDataObj => {
  const defaultRows = generateDefaultRows(DEFAULT_MIX_PAGE_ROWS);
  return {
    tableRowData: {},
    mixTabData: defaultRows,
    notifCtrl: structuredClone(notificationCtrlObj),
    allParentTreeData: {}
  };
};

export const initExtractionStorageState = (
  defaultAgency: MultiOptionsObj,
  defaultCode: string
): ExtractionStorageForm => (
  {
    extraction: {
      useTSC: {
        id: 'ext-agency-tsc-checkbox',
        value: true,
        isInvalid: false
      },
      agency: {
        id: 'ext-agency-combobox',
        value: defaultAgency,
        isInvalid: false
      },
      locationCode: {
        id: 'ext-location-code',
        value: defaultCode,
        isInvalid: false
      },
      startDate: {
        id: 'ext-start-date',
        value: '',
        isInvalid: false
      },
      endDate: {
        id: 'ext-end-date',
        value: '',
        isInvalid: false
      }
    },
    seedStorage: {
      useTSC: {
        id: 'str-agency-tsc-checkbox',
        value: true,
        isInvalid: false
      },
      agency: {
        id: 'str-agency-combobox',
        value: defaultAgency,
        isInvalid: false
      },
      locationCode: {
        id: 'str-location-code',
        value: defaultCode,
        isInvalid: false
      },
      startDate: {
        id: 'str-start-date',
        value: '',
        isInvalid: false
      },
      endDate: {
        id: 'str-end-date',
        value: '',
        isInvalid: false
      }
    }
  }
);

/**
 * Validate Collection Step.
 * Return true if it's invalid, false otherwise.
 */
export const validateCollectionStep = (collectionData: CollectionForm): boolean => {
  let isInvalid = false;
  const collectionkeys = Object.keys(collectionData) as Array<keyof CollectionForm>;
  collectionkeys.forEach((key) => {
    if (collectionData[key].isInvalid) {
      isInvalid = true;
    }
  });
  return isInvalid;
};

/**
 * Validate Ownership Step.
 * Return true if it's invalid, false otherwise.
 */
export const validateOwnershipStep = (ownershipData: Array<SingleOwnerForm>): boolean => {
  let isInvalid = false;
  const ownershipKeys = Object.keys(ownershipData[0]) as Array<keyof SingleOwnerForm>;
  ownershipData.forEach((owner) => {
    ownershipKeys.forEach((key) => {
      if (key !== 'id' && owner[key].isInvalid) {
        isInvalid = true;
      }
    });
  });
  return isInvalid;
};

/**
 * Validate Interim Step.
 * Return true if it's invalid, false otherwise.
 */
export const validateInterimStep = (interimData: InterimForm): boolean => {
  let isInvalid = false;
  const interimKeys = Object.keys(interimData) as Array<keyof InterimForm>;
  interimKeys.forEach((key) => {
    if (interimData[key].isInvalid) {
      isInvalid = true;
    }
  });
  return isInvalid;
};

/**
 * Verify if the collection step is complete
 * Return true if it's complete, false otherwise
 */
export const verifyCollectionStepCompleteness = (collectionData: CollectionForm): boolean => {
  if (!collectionData.collectorAgency.value.code.length) {
    return false;
  }
  if (!collectionData.locationCode.value.length) {
    return false;
  }
  if (!collectionData.startDate.value.length) {
    return false;
  }
  if (!collectionData.endDate.value.length) {
    return false;
  }
  if (!collectionData.numberOfContainers.value.length) {
    return false;
  }
  if (!collectionData.volumePerContainers.value.length) {
    return false;
  }
  if (!collectionData.volumeOfCones.value.length) {
    return false;
  }
  if (!collectionData.selectedCollectionCodes.value.length) {
    return false;
  }
  return true;
};

/**
 * Verify if the ownership step is complete
 * Return true if it's complete, false otherwise
 */
export const verifyOwnershipStepCompleteness = (ownershipData: Array<SingleOwnerForm>): boolean => {
  for (let i = 0; i < ownershipData.length; i += 1) {
    if (!ownershipData[i].ownerAgency.value.code.length
      || !ownershipData[i].ownerCode.value.length
      || !ownershipData[i].ownerPortion.value.length
      || !ownershipData[i].reservedPerc.value.length
      || !ownershipData[i].surplusPerc.value.length
      || !(ownershipData[i].fundingSource.value && ownershipData[i].fundingSource.value.code)
      || !(ownershipData[i].methodOfPayment.value && ownershipData[i].methodOfPayment.value.code)
    ) {
      return false;
    }
  }
  return true;
};

/**
 * Verify if the interim step is complete
 * Return true if it's complete, false otherwise
 */
export const verifyInterimStepCompleteness = (interimData: InterimForm): boolean => {
  if (!interimData.agencyName.value.code.length
    || !interimData.locationCode.value.length
    || !interimData.startDate.value.length
    || !interimData.endDate.value.length
    || !interimData.facilityType.value.length
    || (interimData.facilityType.value === 'OTH' && !interimData.facilityOtherType.value.length)
  ) {
    return false;
  }
  return true;
};

export const getSpeciesOptionByCode = (
  vegCode?: string,
  options?: MultiOptionsObj[]
): MultiOptionsObj => {
  if (!vegCode || !options) {
    return EmptyMultiOptObj;
  }

  const filtered = options.filter((opt) => opt.code === vegCode);
  return filtered.length > 0
    ? filtered[0]
    : EmptyMultiOptObj;
};

/**
 * Validate Orchard Step.
 * Return true if it's Invalid, false otherwise.
 */
export const validateOrchardStep = (orchardStepData: OrchardForm): boolean => {
  let isInvalid = false;

  if (
    orchardStepData.femaleGametic.isInvalid
    || orchardStepData.maleGametic.isInvalid
    || orchardStepData.breedingPercentage.isInvalid
  ) {
    isInvalid = true;
  }

  // Booleans are either true or false so there's no need to check them.
  return isInvalid;
};

/**
 * Verify if the orchard step is complete
 * Return true if it's complete, false otherwise
 */
export const verifyOrchardStepCompleteness = (orchardStepData: OrchardForm): boolean => {
  let isComplete = false;

  orchardStepData.orchards.forEach((orchard) => {
    // if one of the orchard object is populated then it's complete for this field
    if (orchard.selectedItem?.code) {
      isComplete = true;
    }
  });

  if (!isComplete) {
    return isComplete;
  }

  if (
    !orchardStepData.femaleGametic.value.code.length
    || !orchardStepData.maleGametic.value.code.length
  ) {
    isComplete = false;
  }

  return isComplete;
};

/**
 * Validate Parent tree Step.
 * Return true if it's Invalid, false otherwise.
 */
export const validateParentStep = (parentStepData: ParentTreeStepDataObj): boolean => {
  let isInvalid = false;
  // Possible invalid data are contained in tableRowData and mixTabData
  const { tableRowData, mixTabData } = parentStepData;
  // Combine the two data objects
  const combinedData = Object.values(tableRowData).concat(Object.values(mixTabData));

  // validate only if it has data
  if (combinedData.length > 0) {
    const rowKeys = Object.keys(combinedData[0]) as (keyof RowItem)[];
    // If any value is invalid, stop and return true;
    const proceed = true;
    const stop = false;
    combinedData.every((row) => {
      for (let i = 0; i < rowKeys.length; i += 1) {
        const key = rowKeys[i];
        if (key !== 'isMixTab' && key !== 'rowId') {
          if (row[key].isInvalid) {
            isInvalid = true;
            return stop;
          }
        }
      }
      return proceed;
    });
  }

  return isInvalid;
};

/**
 * Verify if the parent step is complete
 * Return true if it's complete, false otherwise.
 * For this step, as long as there is at least 0.0000000001 (10 dec places) cone then it's complete.
 */
export const verifyParentStepCompleteness = (parentStepData: ParentTreeStepDataObj): boolean => {
  const { tableRowData } = parentStepData;

  const tableRows = Object.values(tableRowData);

  const sum = new BigNumber(calcSum(tableRows, 'coneCount'));

  // Max digits is 10, so the smallest possible value is 0.0000000001
  const smallestNumPossible = new BigNumber(1 / (10 ** MAX_DECIMAL_DIGITS));

  const isComplete = sum.gte(smallestNumPossible);

  return isComplete;
};

/**
 * Validate Extraction and Storage Step.
 * Return true if it's Invalid, false otherwise.
 */
export const validateExtractionStep = (extractionStepData: ExtractionStorageForm): boolean => {
  let isInvalid = false;
  if (
    extractionStepData.extraction.agency.isInvalid
    || extractionStepData.extraction.locationCode.isInvalid
    || extractionStepData.extraction.startDate.isInvalid
    || extractionStepData.extraction.endDate.isInvalid
    || extractionStepData.seedStorage.agency.isInvalid
    || extractionStepData.seedStorage.locationCode.isInvalid
    || extractionStepData.seedStorage.startDate.isInvalid
    || extractionStepData.seedStorage.endDate.isInvalid
  ) {
    isInvalid = true;
  }

  return isInvalid;
};

/**
 * Verify if the extraction and storage step is complete
 * Return true if it's complete, false otherwise
 */
export const verifyExtractionStepCompleteness = (
  extractionStepData: ExtractionStorageForm
): boolean => {
  if (!extractionStepData.extraction.agency.value.code.length
    || !extractionStepData.extraction.locationCode.value.length
    || !extractionStepData.seedStorage.agency.value.code.length
    || !extractionStepData.seedStorage.locationCode.value.length
  ) {
    return false;
  }
  return true;
};

/**
 * Check if all steps are completed
 */
export const checkAllStepsCompletion = (status: ProgressIndicatorConfig, extractionCompleteness: boolean) => {
  let allStepsComplete = true;

  Object.keys(status).forEach((key: string) => {
    // We need to check the completeness of the last step, since
    // the initial value of the form is already in complete, but we only
    // update the progress indicator when leaving the step
    if ((!status[key as keyof ProgressIndicatorConfig].isComplete && key !== 'extraction')
        || !extractionCompleteness) {
      allStepsComplete = false;
    }
  });

  return allStepsComplete;
};

export const convertCollection = (collectionData: CollectionForm): CollectionFormSubmitType => ({
  collectionClientNumber: collectionData.collectorAgency.value.code,
  collectionLocnCode: collectionData.locationCode.value,
  collectionStartDate: dateStringToISO(collectionData.startDate.value),
  collectionEndDate: dateStringToISO(collectionData.endDate.value),
  noOfContainers: +collectionData.numberOfContainers.value,
  volPerContainer: +collectionData.volumePerContainers.value,
  clctnVolume: +collectionData.volumeOfCones.value,
  seedlotComment: collectionData.comments.value,
  coneCollectionMethodCodes: collectionData.selectedCollectionCodes.value.map((code) => parseInt(code, 10))
});

export const convertOwnership = (ownershipData: Array<SingleOwnerForm>): Array<SingleOwnerFormSubmitType> => (
  ownershipData.map((owner: SingleOwnerForm) => ({
    ownerClientNumber: owner.ownerAgency.value.code,
    ownerLocnCode: owner.ownerCode.value,
    originalPctOwned: +owner.ownerPortion.value,
    originalPctRsrvd: +owner.reservedPerc.value,
    originalPctSrpls: +owner.surplusPerc.value,
    methodOfPaymentCode: owner.methodOfPayment.value.code,
    sparFundSrceCode: owner.fundingSource.value.code
  }))
);

export const convertInterim = (interimData: InterimForm): InterimFormSubmitType => ({
  intermStrgClientNumber: interimData.agencyName.value.code,
  intermStrgLocnCode: interimData.locationCode.value,
  intermStrgStDate: dateStringToISO(interimData.startDate.value),
  intermStrgEndDate: dateStringToISO(interimData.endDate.value),
  intermOtherFacilityDesc: interimData.facilityOtherType.value,
  intermFacilityCode: interimData.facilityType.value
});

export const convertOrchard = (orchardData: OrchardForm, parentTreeRows: RowDataDictType): OrchardFormSubmitType => ({
  // This is a way of dealing with duplicated orchards
  // and make sure the value is not null
  orchardsId: processOrchards(orchardData.orchards).map((orchard: OrchardObj) => {
    if (orchard.selectedItem) {
      return orchard.selectedItem.code;
    }
    return '';
  }),
  femaleGameticMthdCode: orchardData.femaleGametic.value.code,
  maleGameticMthdCode: orchardData.maleGametic.value.code,
  controlledCrossInd: orchardData.isControlledCross.value,
  biotechProcessesInd: orchardData.hasBiotechProcess.value,
  pollenContaminationInd: orchardData.hasPollenContamination.value,
  pollenContaminationPct: +calcAverage(Object.values(parentTreeRows), 'nonOrchardPollenContam'),
  contaminantPollenBv: +orchardData.breedingPercentage.value,
  // This is a fixed field (for now at least) with the regional code,
  // so the methodology code is always set to 'REG'
  pollenContaminationMthdCode: 'REG'
});

export const convertParentTree = (parentTreeData: ParentTreeStepDataObj, seedlotNumber: string): Array<ParentTreeFormSubmitType> => {
  const parentTreePayload: Array<ParentTreeFormSubmitType> = [];

  // Each key is a parent tree number
  Object.keys(parentTreeData.tableRowData).forEach((key: string) => {
    parentTreePayload.push({
      seedlotNumber,
      parentTreeId: parentTreeData.allParentTreeData[key].parentTreeId,
      parentTreeNumber: parentTreeData.allParentTreeData[key].parentTreeNumber,
      coneCount: +parentTreeData.tableRowData[key].coneCount.value,
      pollenPount: +parentTreeData.tableRowData[key].pollenCount.value,
      smpSuccessPct: +parentTreeData.tableRowData[key].smpSuccessPerc.value,
      nonOrchardPollenContamPct: +parentTreeData.tableRowData[key].nonOrchardPollenContam.value,
      amountOfMaterial: +parentTreeData.tableRowData[key].volume.value,
      proportion: +parentTreeData.tableRowData[key].proportion.value,
      parentTreeGeneticQualities: parentTreeData.allParentTreeData[key].parentTreeGeneticQualities
    });
  });

  return parentTreePayload;
};

export const convertExtraction = (extractionData: ExtractionStorageForm): ExtractionFormSubmitType => ({
  extractoryClientNumber: extractionData.extraction.agency.value.code,
  extractoryLocnCode: extractionData.extraction.locationCode.value,
  extractionStDate: dateStringToISO(extractionData.extraction.startDate.value),
  extractionEndDate: dateStringToISO(extractionData.extraction.endDate.value),
  storageClientNumber: extractionData.seedStorage.agency.value.code,
  storageLocnCode: extractionData.seedStorage.locationCode.value,
  temporaryStrgStartDate: dateStringToISO(extractionData.seedStorage.startDate.value),
  temporaryStrgEndDate: dateStringToISO(extractionData.seedStorage.endDate.value)
});
