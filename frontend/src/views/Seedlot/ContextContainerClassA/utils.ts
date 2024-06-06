import BigNumber from 'bignumber.js';
import { AxiosError } from 'axios';
import { CollectionForm } from '../../../components/SeedlotRegistrationSteps/CollectionStep/definitions';
import InterimForm from '../../../components/SeedlotRegistrationSteps/InterimStep/definitions';
import { OrchardForm, OrchardObj } from '../../../components/SeedlotRegistrationSteps/OrchardStep/definitions';
import { createOwnerTemplate } from '../../../components/SeedlotRegistrationSteps/OwnershipStep/constants';
import { SingleOwnerForm } from '../../../components/SeedlotRegistrationSteps/OwnershipStep/definitions';
import {
  DEFAULT_MIX_PAGE_ROWS, MAX_DECIMAL_DIGITS, notificationCtrlObj,
  rowTemplate
} from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/constants';
import { RowDataDictType, RowItem, StrTypeRowItem } from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/definitions';
import {
  calcAverage, calcSum, generateDefaultRows,
  processOrchards
} from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/utils';
import { EmptyMultiOptObj } from '../../../shared-constants/shared-constants';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import ExtractionStorageForm from '../../../types/SeedlotTypes/ExtractionStorage';
import {
  CollectionFormSubmitType, ExtractionFormSubmitType, InterimFormSubmitType,
  OrchardFormSubmitType, ParentTreeFormSubmitType, RichSeedlotType,
  SeedlotAClassSubmitType, SingleOwnerFormSubmitType
} from '../../../types/SeedlotType';
import { dateStringToISO } from '../../../utils/DateUtils';
import { ErrorDescriptionType } from '../../../types/ErrorDescriptionType';
import ROUTES from '../../../routes/constants';
import { addParamToPath } from '../../../utils/PathUtils';
import { getOptionsInputObj } from '../../../utils/FormInputUtils';

import {
  emptyCollectionStep, emptyExtractionStep, emptyInterimStep,
  emptyOrchardStep, emptyOwnershipStep, stepMap, tscAgencyObj, tscLocationCode
} from './constants';
import {
  AllStepData,
  AreaOfUseDataType,
  ClientAgenciesByCode,
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
  collectionStepData: CollectionFormSubmitType,
  useDefaultAgency = true
): CollectionForm => ({
  useDefaultAgencyInfo: {
    id: 'collection-use-default-agency',
    value: useDefaultAgency,
    isInvalid: false
  },
  collectorAgency: {
    id: 'collection-collector-agency',
    value: defaultAgency,
    isInvalid: false
  },
  locationCode: {
    id: 'collection-location-code',
    value: collectionStepData.collectionLocnCode,
    isInvalid: false
  },
  startDate: {
    id: 'collection-start-date',
    value: collectionStepData.collectionStartDate,
    isInvalid: false
  },
  endDate: {
    id: 'collection-end-date',
    value: collectionStepData.collectionEndDate,
    isInvalid: false
  },
  numberOfContainers: {
    id: 'collection-num-of-container',
    value: collectionStepData.noOfContainers.toString(),
    isInvalid: false
  },
  volumePerContainers: {
    id: 'collection-vol-per-container',
    value: collectionStepData.volPerContainer.toString(),
    isInvalid: false
  },
  volumeOfCones: {
    id: 'collection-vol-of-cones',
    value: collectionStepData.clctnVolume.toString(),
    isInvalid: false
  },
  selectedCollectionCodes: {
    id: 'collection-selected-collection-code',
    value: collectionStepData.coneCollectionMethodCodes.map((methodCode) => methodCode.toString()),
    isInvalid: false
  },
  comments: {
    id: 'collection-comments',
    value: collectionStepData.seedlotComment,
    isInvalid: false
  }
});

export const initOwnershipState = (
  defaultAgency: MultiOptionsObj,
  ownersStepData: Array<SingleOwnerFormSubmitType>,
  useDefault?: boolean,
  methodsOfPayment?: Array<MultiOptionsObj>,
  fundingSource?: Array<MultiOptionsObj>,
  clientData?: ClientAgenciesByCode,
  defaultAgencyNumber = ''
): Array<SingleOwnerForm> => {
  const seedlotOwners: Array<SingleOwnerForm> = ownersStepData.map((curOwner, index) => {
    const ownerState = createOwnerTemplate(index, curOwner);
    ownerState.ownerAgency.value = clientData && !useDefault
      ? clientData[curOwner.ownerClientNumber]
      : defaultAgency;
    ownerState.useDefaultAgencyInfo.value = ownerState
      .ownerAgency.value.code === defaultAgencyNumber;
    ownerState.ownerCode.value = curOwner.ownerLocnCode;
    if (methodsOfPayment && fundingSource) {
      const payment = methodsOfPayment
        .filter((data: MultiOptionsObj) => data.code === curOwner.methodOfPaymentCode)[0];
      const fundSource = fundingSource
        .filter((data: MultiOptionsObj) => data.code === curOwner.sparFundSrceCode)[0];
      ownerState.methodOfPayment.value = payment;
      ownerState.fundingSource.value = fundSource;
    }
    return ownerState;
  });
  return seedlotOwners;
};

export const initInterimState = (
  defaultAgency: MultiOptionsObj,
  interimStepData: InterimFormSubmitType,
  useDefaultAgency = true
): InterimForm => ({
  useCollectorAgencyInfo: {
    id: 'interim-use-collection-agency',
    value: useDefaultAgency,
    isInvalid: false
  },
  agencyName: {
    id: 'interim-agency',
    value: defaultAgency,
    isInvalid: false
  },
  locationCode: {
    id: 'interim-location-code',
    value: interimStepData.intermStrgLocnCode,
    isInvalid: false
  },
  startDate: {
    id: 'storage-start-date',
    value: interimStepData.intermStrgStDate,
    isInvalid: false
  },
  endDate: {
    id: 'storage-end-date',
    value: interimStepData.intermStrgEndDate,
    isInvalid: false
  },
  facilityType: {
    id: 'storage-facility-type',
    value: interimStepData.intermFacilityCode,
    isInvalid: false
  },
  facilityOtherType: {
    id: 'storage-other-type-input',
    value: interimStepData.intermOtherFacilityDesc,
    isInvalid: false
  }
});

const convertToOrchardsType = (
  orchards: Array<MultiOptionsObj> | undefined,
  primaryOrchardId: string,
  secondaryOrchardId: string | null
): Array<OrchardObj> => {
  if (orchards) {
    const orchardsIds: string[] = [primaryOrchardId];
    if (secondaryOrchardId) {
      orchardsIds.push(secondaryOrchardId);
    }
    const filteredOrchards = orchards.filter((curOrch) => orchardsIds.includes(curOrch.code));
    return filteredOrchards.map((curFilteredOrch, index) => ({
      inputId: index,
      selectedItem: curFilteredOrch,
      isInvalid: false
    }));
  }

  return [
    {
      inputId: 0,
      selectedItem: null,
      isInvalid: false
    }
  ];
};

export const initOrchardState = (
  orchardStepData: OrchardFormSubmitType,
  possibleOrchards?: Array<MultiOptionsObj>,
  gameticMethodology?: Array<MultiOptionsObj>
): OrchardForm => (
  {
    orchards: convertToOrchardsType(
      possibleOrchards,
      orchardStepData.primaryOrchardId,
      orchardStepData.secondaryOrchardId
    ),
    femaleGametic: {
      id: 'orchard-female-gametic',
      value: gameticMethodology
        ? gameticMethodology
          .filter((data) => data.code === orchardStepData.femaleGameticMthdCode)[0]
        : EmptyMultiOptObj,
      isInvalid: false
    },
    maleGametic: {
      id: 'orchard-male-gametic',
      value: gameticMethodology
        ? gameticMethodology.filter((data) => data.code === orchardStepData.maleGameticMthdCode)[0]
        : EmptyMultiOptObj,
      isInvalid: false
    },
    isControlledCross: {
      id: 'orchard-is-controlled-cross',
      value: orchardStepData.controlledCrossInd,
      isInvalid: false
    },
    hasBiotechProcess: {
      id: 'orchard-has-biotech-process',
      value: orchardStepData.biotechProcessesInd,
      isInvalid: false
    },
    hasPollenContamination: {
      id: 'orchard-has-pollen-contamination',
      value: orchardStepData.pollenContaminationInd,
      isInvalid: false
    },
    breedingPercentage: {
      id: 'orchard-breading-perc',
      value: orchardStepData.contaminantPollenBv.toString(),
      isInvalid: false
    },
    isRegional: {
      id: 'orchard-is-regional',
      value: true,
      isInvalid: false
    }
  }
);

export const initParentTreeState = (
  parentTrees?: Array<ParentTreeFormSubmitType>,
  smpMixTrees?: Array<ParentTreeFormSubmitType>
): ParentTreeStepDataObj => {
  const defaultRows = generateDefaultRows(DEFAULT_MIX_PAGE_ROWS);
  let tableRowsData: RowDataDictType = {};
  let smpMixRows: RowDataDictType = {};
  if (parentTrees) {
    parentTrees.forEach(
      (curParentTree) => {
        const newRow: RowItem = structuredClone(rowTemplate);
        newRow.parentTreeNumber.value = curParentTree.parentTreeNumber;
        newRow.coneCount.value = curParentTree.coneCount.toString();
        newRow.pollenCount.value = curParentTree.pollenCount.toString();
        newRow.smpSuccessPerc.value = curParentTree.smpSuccessPct.toString();
        newRow.nonOrchardPollenContam.value = curParentTree.nonOrchardPollenContamPct.toString();
        curParentTree.parentTreeGeneticQualities.forEach((singleGenWorthObj) => {
          const genWorthName = singleGenWorthObj.geneticWorthCode
            .toLowerCase() as keyof StrTypeRowItem;

          if (Object.prototype.hasOwnProperty.call(newRow, genWorthName)) {
            newRow[genWorthName].value = String(singleGenWorthObj.geneticQualityValue);
          }
        });
        tableRowsData = Object.assign(tableRowsData, {
          [curParentTree.parentTreeNumber]: newRow
        });
      }
    );

    // The SMP Mix is optional and will only be available if the parent trees
    // are also available, so the check needs to be inside of the parent 'if'
    if (smpMixTrees) {
      smpMixTrees.forEach(
        (curSmpMix) => {
          const newRow: RowItem = structuredClone(rowTemplate);
          newRow.rowId = curSmpMix.parentTreeId.toString();
          newRow.parentTreeNumber.value = curSmpMix.parentTreeNumber;
          newRow.isMixTab = true;
          newRow.proportion.value = curSmpMix.proportion.toString();
          newRow.volume.value = curSmpMix.amountOfMaterial.toString();
          curSmpMix.parentTreeGeneticQualities.forEach((singleGenWorthObj) => {
            const genWorthName = singleGenWorthObj.geneticWorthCode
              .toLowerCase() as keyof StrTypeRowItem;

            if (Object.prototype.hasOwnProperty.call(newRow, genWorthName)) {
              newRow[genWorthName].value = String(singleGenWorthObj.geneticQualityValue);
            }
          });
          smpMixRows = Object.assign(smpMixRows, {
            [curSmpMix.parentTreeNumber]: newRow
          });
        }
      );
    }
  }

  return {
    tableRowData: tableRowsData,
    mixTabData: Object.keys(smpMixRows).length === 0 ? defaultRows : smpMixRows,
    notifCtrl: structuredClone(notificationCtrlObj),
    allParentTreeData: {}
  };
};

export const initExtractionStorageState = (
  defaultExtractAgency: MultiOptionsObj,
  defaultStorageAgency: MultiOptionsObj,
  extractionStepData: ExtractionFormSubmitType,
  useTSCExtract = true,
  useTSCStorage = true
): ExtractionStorageForm => (
  {
    extraction: {
      useTSC: {
        id: 'ext-agency-tsc-checkbox',
        value: useTSCExtract,
        isInvalid: false
      },
      agency: {
        id: 'ext-agency-combobox',
        value: defaultExtractAgency,
        isInvalid: false
      },
      locationCode: {
        id: 'ext-location-code',
        value: useTSCExtract ? tscLocationCode : extractionStepData.extractoryLocnCode,
        isInvalid: false
      },
      startDate: {
        id: 'ext-start-date',
        value: extractionStepData.extractionStDate,
        isInvalid: false
      },
      endDate: {
        id: 'ext-end-date',
        value: extractionStepData.extractionEndDate,
        isInvalid: false
      }
    },
    seedStorage: {
      useTSC: {
        id: 'str-agency-tsc-checkbox',
        value: useTSCStorage,
        isInvalid: false
      },
      agency: {
        id: 'str-agency-combobox',
        value: defaultStorageAgency,
        isInvalid: false
      },
      locationCode: {
        id: 'str-location-code',
        value: useTSCStorage ? tscLocationCode : extractionStepData.storageLocnCode,
        isInvalid: false
      },
      startDate: {
        id: 'str-start-date',
        value: extractionStepData.temporaryStrgStartDate,
        isInvalid: false
      },
      endDate: {
        id: 'str-end-date',
        value: extractionStepData.temporaryStrgEndDate,
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
export const checkAllStepsCompletion = (
  status: ProgressIndicatorConfig,
  isExtractionStepComplete: boolean
) => {
  let allStepsComplete = true;

  Object.keys(status).forEach((key: string) => {
    // We need to check the completeness of the last step, since
    // the initial value of the form is already in complete, but we only
    // update the progress indicator when leaving the step
    if ((!status[key as keyof ProgressIndicatorConfig].isComplete && key !== 'extraction')
      || !isExtractionStepComplete) {
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
  coneCollectionMethodCodes: collectionData
    .selectedCollectionCodes.value.map((code) => parseInt(code, 10))
});

export const convertOwnership = (
  ownershipData: Array<SingleOwnerForm>
): Array<SingleOwnerFormSubmitType> => (
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

export const convertOrchard = (
  orchardData: OrchardForm,
  parentTreeRows: RowDataDictType
): OrchardFormSubmitType => {
  const deDuppedOrchards = processOrchards(orchardData.orchards);
  let primaryOrchardId: string = '';
  let secondaryOrchardId = null;

  if (deDuppedOrchards.length > 0) {
    primaryOrchardId = deDuppedOrchards[0].selectedItem!.code;
  }
  if (deDuppedOrchards.length > 1) {
    secondaryOrchardId = deDuppedOrchards[1].selectedItem!.code;
  }

  return ({
    primaryOrchardId,
    secondaryOrchardId,
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
};

export const convertParentTree = (
  parentTreeData: ParentTreeStepDataObj,
  seedlotNumber: string
): Array<ParentTreeFormSubmitType> => {
  const parentTreePayload: Array<ParentTreeFormSubmitType> = [];

  // Each key is a parent tree number
  Object.keys(parentTreeData.tableRowData).forEach((key: string) => {
    parentTreePayload.push({
      seedlotNumber,
      parentTreeId: parentTreeData.allParentTreeData[key].parentTreeId,
      parentTreeNumber: parentTreeData.allParentTreeData[key].parentTreeNumber,
      coneCount: +parentTreeData.tableRowData[key].coneCount.value,
      pollenCount: +parentTreeData.tableRowData[key].pollenCount.value,
      smpSuccessPct: +parentTreeData.tableRowData[key].smpSuccessPerc.value,
      nonOrchardPollenContamPct: +parentTreeData.tableRowData[key].nonOrchardPollenContam.value,
      amountOfMaterial: +parentTreeData.tableRowData[key].volume.value,
      proportion: +parentTreeData.tableRowData[key].proportion.value,
      parentTreeGeneticQualities: parentTreeData.allParentTreeData[key].parentTreeGeneticQualities
    });
  });

  return parentTreePayload;
};

export const convertSmpParentTree = (
  smpParentTreeData: ParentTreeStepDataObj,
  seedlotNumber: string
): Array<ParentTreeFormSubmitType> => {
  const { allParentTreeData } = smpParentTreeData;
  const smpMixPayload: Array<ParentTreeFormSubmitType> = [];

  if (smpParentTreeData.mixTabData) {
    Object.keys(smpParentTreeData.mixTabData).forEach((key: string) => {
      // Each key is a line in the table, so we need to get
      // the parent tree value that the user set and use it
      const curParentTree = smpParentTreeData.mixTabData[key].parentTreeNumber.value;
      if (allParentTreeData[curParentTree]) {
        smpMixPayload.push({
          seedlotNumber,
          parentTreeId: smpParentTreeData.allParentTreeData[curParentTree].parentTreeId,
          parentTreeNumber: smpParentTreeData.allParentTreeData[curParentTree].parentTreeNumber,
          coneCount: +smpParentTreeData.mixTabData[key].coneCount.value,
          pollenCount: +smpParentTreeData.mixTabData[key].pollenCount.value,
          smpSuccessPct: +smpParentTreeData.mixTabData[key].smpSuccessPerc.value,
          nonOrchardPollenContamPct: +smpParentTreeData
            .mixTabData[key].nonOrchardPollenContam.value,
          amountOfMaterial: +smpParentTreeData.mixTabData[key].volume.value,
          proportion: +smpParentTreeData.mixTabData[key].proportion.value,
          parentTreeGeneticQualities: smpParentTreeData
            .allParentTreeData[curParentTree].parentTreeGeneticQualities
        });
      }
    });
  }

  return smpMixPayload;
};

export const convertExtraction = (
  extractionData: ExtractionStorageForm
): ExtractionFormSubmitType => ({
  extractoryClientNumber: extractionData.extraction.agency.value.code,
  extractoryLocnCode: extractionData.extraction.locationCode.value,
  extractionStDate: dateStringToISO(extractionData.extraction.startDate.value),
  extractionEndDate: dateStringToISO(extractionData.extraction.endDate.value),
  storageClientNumber: extractionData.seedStorage.agency.value.code,
  storageLocnCode: extractionData.seedStorage.locationCode.value,
  temporaryStrgStartDate: dateStringToISO(extractionData.seedStorage.startDate.value),
  temporaryStrgEndDate: dateStringToISO(extractionData.seedStorage.endDate.value)
});

export const getSeedlotSubmitErrDescription = (err: AxiosError): ErrorDescriptionType => {
  switch (err.response?.status) {
    case 401:
      return {
        title: 'Session expired!',
        description: 'Your session has expired. Please refresh the page and log in again to continue. (Error code 401)'
      };
    case 500:
      return {
        title: 'Submission failure!',
        description: 'An unexpected error occurred while submitting your seedlot registration. Please try again, and if the issue persists, contact support. (Error code 500)'
      };
    case 503:
      return {
        title: 'Network error!',
        description: 'System is facing network issues at the moment. Please check your internet connection and retry. (Error code 503)'
      };
    default:
      return {
        title: 'Unknown failure!',
        description: `${err.message} (Error code ${err.response?.status ?? err.code})`
      };
  }
};

export const getBreadcrumbs = (seedlotNumber: string) => [
  {
    name: 'Seedlots',
    path: ROUTES.SEEDLOTS
  },
  {
    name: 'My seedlots',
    path: ROUTES.MY_SEEDLOTS
  },
  {
    name: `Seedlot ${seedlotNumber}`,
    path: `${addParamToPath(ROUTES.SEEDLOT_DETAILS, seedlotNumber)}`
  }
];

export const getSeedlotPayload = (
  allStepData: AllStepData,
  seedlotNumber: string | undefined
): SeedlotAClassSubmitType => ({
  seedlotFormCollectionDto: convertCollection(allStepData.collectionStep),
  seedlotFormOwnershipDtoList: convertOwnership(allStepData.ownershipStep),
  seedlotFormInterimDto: convertInterim(allStepData.interimStep),
  seedlotFormOrchardDto: convertOrchard(
    allStepData.orchardStep,
    allStepData.parentTreeStep.tableRowData
  ),
  seedlotFormParentTreeDtoList: convertParentTree(allStepData.parentTreeStep, (seedlotNumber ?? '')),
  seedlotFormParentTreeSmpDtoList: convertSmpParentTree(allStepData.parentTreeStep, (seedlotNumber ?? '')),
  seedlotFormExtractionDto: convertExtraction(allStepData.extractionStorageStep)
});

export const initEmptySteps = () => ({
  collectionStep: initCollectionState(EmptyMultiOptObj, emptyCollectionStep),
  ownershipStep: initOwnershipState(EmptyMultiOptObj, emptyOwnershipStep, true),
  interimStep: initInterimState(EmptyMultiOptObj, emptyInterimStep),
  orchardStep: initOrchardState(emptyOrchardStep),
  parentTreeStep: initParentTreeState(),
  extractionStorageStep: initExtractionStorageState(
    tscAgencyObj,
    tscAgencyObj,
    emptyExtractionStep
  )
});

export const resDataToState = (
  fullFormData: SeedlotAClassSubmitType,
  defaultAgencyNumber: string | undefined,
  methodsOfPaymentData: MultiOptionsObj[],
  fundingSourcesData: MultiOptionsObj[],
  orchardQueryData: MultiOptionsObj[],
  gameticMethodologyData: MultiOptionsObj[],
  clientData: ClientAgenciesByCode
): AllStepData => (
  {
    collectionStep: initCollectionState(
      clientData[fullFormData.seedlotFormCollectionDto.collectionClientNumber],
      fullFormData.seedlotFormCollectionDto,
      fullFormData.seedlotFormCollectionDto.collectionClientNumber === defaultAgencyNumber
    ),
    ownershipStep: initOwnershipState(
      EmptyMultiOptObj,
      fullFormData.seedlotFormOwnershipDtoList,
      false,
      methodsOfPaymentData,
      fundingSourcesData,
      clientData,
      defaultAgencyNumber
    ),
    interimStep: initInterimState(
      clientData[fullFormData.seedlotFormInterimDto.intermStrgClientNumber],
      fullFormData.seedlotFormInterimDto,
      // eslint-disable-next-line max-len
      fullFormData.seedlotFormInterimDto.intermStrgClientNumber === fullFormData.seedlotFormCollectionDto.collectionClientNumber
    ),
    orchardStep: initOrchardState(
      fullFormData.seedlotFormOrchardDto,
      orchardQueryData,
      gameticMethodologyData
    ),
    parentTreeStep: initParentTreeState(
      fullFormData.seedlotFormParentTreeDtoList,
      fullFormData.seedlotFormParentTreeSmpDtoList
    ),
    extractionStorageStep: initExtractionStorageState(
      clientData[fullFormData.seedlotFormExtractionDto.extractoryClientNumber],
      clientData[fullFormData.seedlotFormExtractionDto.storageClientNumber],
      fullFormData.seedlotFormExtractionDto,
      fullFormData.seedlotFormExtractionDto.extractoryClientNumber === tscAgencyObj.code,
      fullFormData.seedlotFormExtractionDto.storageClientNumber === tscAgencyObj.code
    )
  }
);

export const fillAreaOfUseData = (
  seedlotData: RichSeedlotType,
  areaOfUseData: AreaOfUseDataType
): AreaOfUseDataType => {
  const clonedAreaOfUse = structuredClone(areaOfUseData);
  // Primary SPZ
  if (seedlotData.primarySpz) {
    clonedAreaOfUse.primarySpz.value.code = seedlotData.primarySpz.code;
    clonedAreaOfUse.primarySpz.value.description = seedlotData.primarySpz.description;
    clonedAreaOfUse.primarySpz.value.label = `${seedlotData.primarySpz.code} - ${seedlotData.primarySpz.description}`;
  }
  // Additional SPZs
  if (seedlotData.additionalSpzList) {
    clonedAreaOfUse.additionalSpzList = seedlotData.additionalSpzList.map((spz, index) => (
      getOptionsInputObj(
        `area-of-use-additional-spz-${index}`,
        {
          code: spz.code,
          description: spz.description,
          label: `${spz.code} - ${spz.description}`
        }
      )
    ));
  }
  // Elevation
  if (seedlotData.seedlot.elevationMin !== null) {
    clonedAreaOfUse.minElevation.value = seedlotData.seedlot.elevationMin.toString();
  }
  if (seedlotData.seedlot.elevationMax !== null) {
    clonedAreaOfUse.maxElevation.value = seedlotData.seedlot.elevationMax.toString();
  }
  // Lat
  if (seedlotData.seedlot.latitudeDegMin !== null) {
    clonedAreaOfUse.minLatDeg.value = seedlotData.seedlot.latitudeDegMin.toString();
  }
  if (seedlotData.seedlot.latitudeDegMax !== null) {
    clonedAreaOfUse.maxLatDeg.value = seedlotData.seedlot.latitudeDegMax.toString();
  }
  if (seedlotData.seedlot.latitudeMinMin !== null) {
    clonedAreaOfUse.minLatMinute.value = seedlotData.seedlot.latitudeMinMin.toString();
  }
  if (seedlotData.seedlot.latitudeMinMax !== null) {
    clonedAreaOfUse.maxLatMinute.value = seedlotData.seedlot.latitudeMinMax.toString();
  }
  if (seedlotData.seedlot.latitudeSecMin !== null) {
    clonedAreaOfUse.minLatSec.value = seedlotData.seedlot.latitudeSecMin.toString();
  }
  if (seedlotData.seedlot.latitudeSecMax !== null) {
    clonedAreaOfUse.maxLatSec.value = seedlotData.seedlot.latitudeSecMax.toString();
  }
  // Long
  if (seedlotData.seedlot.longitudeDegMin !== null) {
    clonedAreaOfUse.minLongDeg.value = seedlotData.seedlot.longitudeDegMin.toString();
  }
  if (seedlotData.seedlot.longitudeDegMax !== null) {
    clonedAreaOfUse.maxLongDeg.value = seedlotData.seedlot.longitudeDegMax.toString();
  }
  if (seedlotData.seedlot.longitudeMinMin !== null) {
    clonedAreaOfUse.minLongMinute.value = seedlotData.seedlot.longitudeMinMin.toString();
  }
  if (seedlotData.seedlot.longitudeMinMax !== null) {
    clonedAreaOfUse.maxLongMinute.value = seedlotData.seedlot.longitudeMinMax.toString();
  }
  if (seedlotData.seedlot.longitudeSecMin !== null) {
    clonedAreaOfUse.minLongSec.value = seedlotData.seedlot.longitudeSecMin.toString();
  }
  if (seedlotData.seedlot.longitudeSecMax !== null) {
    clonedAreaOfUse.maxLongSec.value = seedlotData.seedlot.longitudeSecMax.toString();
  }

  return clonedAreaOfUse;
};
