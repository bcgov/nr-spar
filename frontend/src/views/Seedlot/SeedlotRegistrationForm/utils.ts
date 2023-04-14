import { ownerTemplate } from '../../../components/SeedlotRegistrationSteps/OwnershipStep/constants';

export const initCollectionState = (
  defaultAgency: string,
  defaultCode: string
) => ({
  collectorAgency: defaultAgency,
  locationCode: defaultCode,
  startDate: '',
  endDate: '',
  numberOfContainers: '1',
  volumePerContainers: '1',
  volumeOfCones: '1',
  aerialRanking: false,
  aerialClippingTopping: false,
  felledTrees: false,
  climbing: false,
  squirrelCache: false,
  ground: false,
  squirrelHarvesting: false,
  other: false,
  collectionMethodName: '',
  comments: ''
});

export const initOwnershipState = (
  defaultAgency: string,
  defaultCode: string,
  defaultPayment: string
) => {
  const initialOwnerState = { ...ownerTemplate };
  initialOwnerState.id = 0;
  initialOwnerState.ownerAgency = defaultAgency;
  initialOwnerState.ownerCode = defaultCode;
  initialOwnerState.ownerPortion = '100';
  initialOwnerState.methodOfPayment = defaultPayment;
  return initialOwnerState;
};

export const initInterimState = (
  defaultAgency: string,
  defaultCode: string
) => ({
  agencyName: defaultAgency,
  locationCode: defaultCode,
  startDate: '',
  endDate: '',
  storageLocation: '',
  facilityType: 'OCV'
});

export const initOrchardState = () => (
  {
    orchardId: '',
    orchardName: '',
    additionalId: '',
    additionalName: '',
    femaleGametic: '',
    maleGametic: '',
    controlledCross: true,
    biotechProcess: true,
    noPollenContamination: true,
    breedingPercentage: '0',
    pollenMethodology: true
  }
);
