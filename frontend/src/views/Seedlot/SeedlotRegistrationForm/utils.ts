import { useRef } from 'react';
import { OrchardForm } from '../../../components/SeedlotRegistrationSteps/OrchardStep/definitions';
import {
  ownerTemplate,
  validTemplate as ownerInvalidTemplate
} from '../../../components/SeedlotRegistrationSteps/OwnershipStep/constants';
import { notificationCtrlObj } from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/constants';
import { RowDataDictType } from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/definitions';
import { getMixRowTemplate } from '../../../components/SeedlotRegistrationSteps/ParentTreeStep/utils';
import {
  FormInvalidationObj, OwnershipInvalidObj, ParentTreeStepDataObj
} from './definitions';

export const initCollectionState = (
  defaultAgency: string,
  defaultCode: string
) => ({
  useDefaultAgencyInfo: {
    value: true,
    ref: useRef(null),
    invalid: {
      isInvalid: false,
      invalidText: ''
    }
  },
  collectorAgency: {
    value: defaultAgency,
    ref: useRef(null),
    invalid: {
      isInvalid: false,
      invalidText: ''
    }
  },
  locationCode: {
    value: defaultCode,
    ref: useRef(null),
    invalid: {
      isInvalid: false,
      invalidText: ''
    }
  },
  startDate: {
    value: '',
    ref: useRef(null),
    invalid: {
      isInvalid: false,
      invalidText: ''
    }
  },
  endDate: {
    value: '',
    ref: useRef(null),
    invalid: {
      isInvalid: false,
      invalidText: ''
    }
  },
  numberOfContainers: {
    value: '1',
    ref: useRef(null),
    invalid: {
      isInvalid: false,
      invalidText: ''
    }
  },
  volumePerContainers: {
    value: '1',
    ref: useRef(null),
    invalid: {
      isInvalid: false,
      invalidText: ''
    }
  },
  volumeOfCones: {
    value: '1',
    ref: useRef(null),
    invalid: {
      isInvalid: false,
      invalidText: ''
    }
  },
  selectedCollectionCodes: {
    value: [],
    ref: useRef(null),
    invalid: {
      isInvalid: false,
      invalidText: ''
    }
  },
  comments: {
    value: '',
    ref: useRef(null),
    invalid: {
      isInvalid: false,
      invalidText: ''
    }
  }
});

export const initOwnershipState = (
  defaultAgency: string,
  defaultCode: string
) => {
  const initialOwnerState = { ...ownerTemplate };
  initialOwnerState.id = 0;
  initialOwnerState.ownerAgency = defaultAgency;
  initialOwnerState.ownerCode = defaultCode;
  initialOwnerState.ownerPortion = '100';
  return initialOwnerState;
};

export const initInterimState = (
  defaultAgency: string,
  defaultCode: string
) => ({
  useCollectorAgencyInfo: true,
  agencyName: defaultAgency,
  locationCode: defaultCode,
  startDate: '',
  endDate: '',
  storageLocation: '',
  facilityType: 'OCV'
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

// Generate 20 default rows to be used in the SMP mix tab in Parent Tree step
export const generateDefaultRows = (): RowDataDictType => {
  const generated = {};
  for (let i = 0; i < 20; i += 1) {
    const newRow = getMixRowTemplate();
    const stringIndex = String(i);
    newRow.rowId = stringIndex;
    Object.assign(generated, { [stringIndex]: newRow });
  }
  return generated;
};

export const initParentTreeState = (): ParentTreeStepDataObj => (
  {
    tableRowData: {},
    mixTabData: generateDefaultRows(),
    notifCtrl: structuredClone(notificationCtrlObj),
    allParentTreeData: {}
  }
);

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

export const initInvalidationObj = () => {
  const returnObj: FormInvalidationObj = {};
  return returnObj;
};

export const initOwnerShipInvalidState = (): OwnershipInvalidObj => {
  const initialOwnerInvalidState = { ...ownerInvalidTemplate };
  return {
    0: initialOwnerInvalidState
  };
};
