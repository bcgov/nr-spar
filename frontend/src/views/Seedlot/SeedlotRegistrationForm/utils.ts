import { CollectionForm } from '../../../components/SeedlotRegistrationSteps/CollectionStep/definitions';
import InterimForm from '../../../components/SeedlotRegistrationSteps/InterimStep/definitions';
import { OrchardForm } from '../../../components/SeedlotRegistrationSteps/OrchardStep/definitions';
import { createOwnerTemplate } from '../../../components/SeedlotRegistrationSteps/OwnershipStep/constants';
import { SingleOwnerForm } from '../../../components/SeedlotRegistrationSteps/OwnershipStep/definitions';
import { DEFAULT_MIX_PAGE_ROWS, notificationCtrlObj } from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/constants';
import { generateDefaultRows } from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/utils';
import { EmptyMultiOptObj } from '../../../shared-constants/shared-constants';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import {
  ParentTreeStepDataObj
} from './definitions';

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
        selectedItem: null
      }
    ],
    femaleGametic: '',
    maleGametic: '',
    controlledCross: true,
    biotechProcess: true,
    noPollenContamination: true,
    breedingPercentage: '0',
    pollenMethodology: true
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
  defaultAgency: string,
  defaultCode: string
) => (
  {
    extractoryUseTSC: true,
    extractoryAgency: defaultAgency,
    extractoryLocationCode: defaultCode,
    extractionStartDate: '',
    extractionEndDate: '',
    seedStorageUseTSC: true,
    seedStorageAgency: defaultAgency,
    seedStorageLocationCode: defaultCode,
    seedStorageStartDate: '',
    seedStorageEndDate: ''
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
  if (!collectionData.collectorAgency.value.length) {
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
