import { BecCatalogueItem } from '../../../api-service/becCatalogueAPI';
import { BClassCollectionForm } from '../../../components/SeedlotRegistrationSteps/BClassCollectionStep/definitions';
import MultiOptionsObj from '../../../types/MultiOptionsObject';
import {
  validateBClassCollectionStep,
  verifyBClassCollectionStepCompleteness,
  initBClassCollectionState,
  initBClassCollectionStateFromDto
} from '../../../components/SeedlotRegistrationSteps/BClassCollectionStep/utils';
import {
  BClassCollectionFormSubmitType,
  RichSeedlotType,
  SeedlotBClassFullFormType,
  SeedlotBClassSubmitType
} from '../../../types/SeedlotType';
import { localDateToUtcFormat } from '../../../utils/DateUtils';
import {
  convertExtraction,
  convertInterim,
  convertOwnership,
  initExtractionStorageState,
  initInterimState,
  initOwnershipState,
  validateExtractionStep,
  validateInterimStep,
  validateOwnershipStep,
  verifyExtractionStepCompleteness,
  verifyInterimStepCompleteness,
  verifyOwnershipStepCompleteness
} from '../ContextContainerClassA/utils';
import {
  emptyExtractionStep,
  emptyInterimStep,
  emptyOwnershipStep,
  tscAgencyObj
} from '../ContextContainerClassA/constants';
import {
  BClassAllStepData,
  BClassProgressIndicatorConfig
} from './definitions';
import { stepMap } from './constants';

export const initProgressBar = (
  currentStep: number,
  progressConfig: BClassProgressIndicatorConfig
): BClassProgressIndicatorConfig => {
  const cloned = structuredClone(progressConfig);

  Object.keys(stepMap).forEach((key: string) => {
    const numKey = parseInt(key, 10);
    if (numKey === currentStep) {
      cloned[stepMap[numKey]].isCurrent = true;
    }
  });

  return cloned;
};

export const initEmptySteps = (
  defaultAgencyNumber = '',
  defaultLocCode = ''
): BClassAllStepData => ({
  collectionStep: initBClassCollectionState(defaultAgencyNumber, defaultLocCode),
  ownershipStep: initOwnershipState('', emptyOwnershipStep),
  interimStep: initInterimState('', emptyInterimStep),
  extractionStorageStep: initExtractionStorageState(
    tscAgencyObj.code,
    tscAgencyObj.code,
    emptyExtractionStep
  )
});

export const updateStepStatus = (
  stepName: keyof BClassProgressIndicatorConfig,
  stepStatusObj: BClassProgressIndicatorConfig[keyof BClassProgressIndicatorConfig],
  allStepData: BClassAllStepData,
  becCatalogue?: BecCatalogueItem[]
) => {
  const stepStatus = { ...stepStatusObj };

  if (stepName === 'collection') {
    stepStatus.isInvalid = validateBClassCollectionStep(allStepData.collectionStep, becCatalogue);
    if (!stepStatus.isInvalid) {
      stepStatus.isComplete = verifyBClassCollectionStepCompleteness(
        allStepData.collectionStep,
        becCatalogue
      );
    }
  }
  if (stepName === 'ownership') {
    stepStatus.isInvalid = validateOwnershipStep(allStepData.ownershipStep);
    if (!stepStatus.isInvalid) {
      stepStatus.isComplete = verifyOwnershipStepCompleteness(allStepData.ownershipStep);
    }
  }
  if (stepName === 'interim') {
    stepStatus.isInvalid = validateInterimStep(allStepData.interimStep);
    if (!stepStatus.isInvalid) {
      stepStatus.isComplete = verifyInterimStepCompleteness(allStepData.interimStep);
    }
  }
  if (stepName === 'extraction') {
    stepStatus.isInvalid = validateExtractionStep(allStepData.extractionStorageStep);
    if (!stepStatus.isInvalid) {
      stepStatus.isComplete = verifyExtractionStepCompleteness(allStepData.extractionStorageStep);
    }
  }

  return stepStatus;
};

export const checkAllStepsCompletion = (
  status: BClassProgressIndicatorConfig,
  allStepData: BClassAllStepData,
  isExtractionStepComplete: boolean,
  becCatalogue?: BecCatalogueItem[]
) => {
  if (!isExtractionStepComplete) {
    return false;
  }

  if (!verifyBClassCollectionStepCompleteness(allStepData.collectionStep, becCatalogue)) {
    return false;
  }
  if (!verifyOwnershipStepCompleteness(allStepData.ownershipStep)) {
    return false;
  }
  if (!verifyInterimStepCompleteness(allStepData.interimStep)) {
    return false;
  }

  return (Object.keys(status) as Array<keyof BClassProgressIndicatorConfig>).every((key) => (
    status[key].isComplete || key === 'extraction'
  ));
};

export const mergeDraftCollectionStep = (
  draftCollection: Partial<BClassCollectionForm> | undefined,
  defaultAgencyNumber: string,
  defaultLocCode: string
): BClassCollectionForm => {
  const empty = initBClassCollectionState(defaultAgencyNumber, defaultLocCode);
  if (!draftCollection) {
    return empty;
  }
  return {
    ...empty,
    ...draftCollection
  };
};

export const isDraftAllStepDataEmpty = (
  allStepData: Record<string, unknown> | undefined
): boolean => Object.keys(allStepData ?? {}).length === 0;

export const applyApplicantDefaultsToSteps = (
  steps: BClassAllStepData,
  clientNumber: string,
  locationCode: string
): BClassAllStepData => ({
  ...steps,
  collectionStep: {
    ...steps.collectionStep,
    collectorAgency: { ...steps.collectionStep.collectorAgency, value: clientNumber },
    locationCode: { ...steps.collectionStep.locationCode, value: locationCode }
  },
  ownershipStep: steps.ownershipStep.map((owner) => ({
    ...owner,
    ownerAgency: { ...owner.ownerAgency, value: clientNumber },
    ownerCode: { ...owner.ownerCode, value: locationCode }
  })),
  interimStep: {
    ...steps.interimStep,
    agencyName: { ...steps.interimStep.agencyName, value: clientNumber },
    locationCode: { ...steps.interimStep.locationCode, value: locationCode }
  }
});

export const hydrateFromDraftPayload = (
  draft: { allStepData: Record<string, unknown>; revisionCount: number },
  defaultAgency: string,
  defaultLoc: string
): { allStepData: BClassAllStepData; revisionCount: number } => {
  const draftStepData = draft.allStepData as Partial<BClassAllStepData>;
  return {
    allStepData: {
      collectionStep: mergeDraftCollectionStep(
        draftStepData.collectionStep,
        defaultAgency,
        defaultLoc
      ),
      ownershipStep: draftStepData.ownershipStep
        ?? initEmptySteps(defaultAgency, defaultLoc).ownershipStep,
      interimStep: draftStepData.interimStep
        ?? initEmptySteps(defaultAgency, defaultLoc).interimStep,
      extractionStorageStep: draftStepData.extractionStorageStep
        ?? initEmptySteps(defaultAgency, defaultLoc).extractionStorageStep
    },
    revisionCount: draft.revisionCount
  };
};

const parseCoord = (value: string): number => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const convertBClassCollection = (
  collectionData: BClassCollectionForm,
  richSeedlotData?: RichSeedlotType
): BClassCollectionFormSubmitType => {
  const latDeg = parseCoord(collectionData.latDeg.value);
  const latMin = parseCoord(collectionData.latMin.value);
  const latSec = parseCoord(collectionData.latSec.value);
  const longDeg = parseCoord(collectionData.longDeg.value);
  const longMin = parseCoord(collectionData.longMin.value);
  const longSec = parseCoord(collectionData.longSec.value);
  const seedlot = richSeedlotData?.seedlot;
  const seedPlanZoneCode = seedlot?.seedPlanZoneCode
    ?? richSeedlotData?.primarySpz?.code
    ?? richSeedlotData?.primarySpu?.seedPlanZoneCode
    ?? null;

  return {
    collectionClientNumber: collectionData.collectorAgency.value,
    collectionLocnCode: collectionData.locationCode.value,
    collectionStartDate: localDateToUtcFormat(collectionData.startDate.value)!,
    collectionEndDate: localDateToUtcFormat(collectionData.endDate.value)!,
    noOfContainers: +collectionData.numberOfContainers.value,
    volPerContainer: +collectionData.volumePerContainers.value,
    clctnVolume: +collectionData.volumeOfCones.value,
    seedlotComment: collectionData.comments.value,
    coneCollectionMethodCodes: collectionData
      .selectedCollectionCodes.value.map((code) => parseInt(code, 10)),
    collectionLocationDesc: collectionData.locationArea.value,
    orgUnitNo: collectionData.orgUnit.value.code
      ? parseInt(collectionData.orgUnit.value.code, 10)
      : null,
    collectionStandardMetInd: true,
    collectionAreaRadius: collectionData.collectionRadius.value
      ? +collectionData.collectionRadius.value
      : null,
    captureMethodCode: collectionData.captureMethod.value.code,
    seedPlanZoneCode,
    collectionSeedPlanZoneInd: true,
    seedCoastAreaCode: seedlot?.seedCoastAreaCode ?? null,
    collectionBgcValidatedInd: true,
    // Owned by the collection area map; round-tripped here so a resave preserves it.
    becOverrideInd: seedlot?.becOverrideInd ?? false,
    becOverrideComment: seedlot?.becOverrideComment ?? null,
    numberTreesFromCode: collectionData.numberTreesFrom.value.code,
    isLotSplitInd: false,
    // Preserve loaded values when re-saving; default for brand-new drafts
    superiorProvenanceInd: seedlot ? seedlot.superiorProvenanceInd : false,
    provenanceId: seedlot?.provenanceId ?? null,
    collectionLatitudeDeg: latDeg,
    collectionLatitudeMin: latMin,
    collectionLatitudeSec: latSec,
    collectionLongitudeDeg: longDeg,
    collectionLongitudeMin: longMin,
    collectionLongitudeSec: longSec,
    collectionElevation: collectionData.elevationMean.value
      ? parseInt(collectionData.elevationMean.value, 10)
      : null,
    collectionElevationMin: collectionData.elevationMin.value
      ? parseInt(collectionData.elevationMin.value, 10)
      : null,
    collectionElevationMax: collectionData.elevationMax.value
      ? parseInt(collectionData.elevationMax.value, 10)
      : null,
    elevationMin: seedlot?.elevationMin ?? null,
    elevationMax: seedlot?.elevationMax ?? null,
    latitudeDegMin: latDeg,
    latitudeMinMin: latMin,
    latitudeDegMax: latDeg,
    latitudeMinMax: latMin,
    longitudeDegMin: longDeg,
    longitudeMinMin: longMin,
    longitudeDegMax: longDeg,
    longitudeMinMax: longMin,
    latitudeSecMin: latSec,
    latitudeSecMax: latSec,
    longitudeSecMin: longSec,
    longitudeSecMax: longSec,
    areaOfUseComment: null,
    collectionLatitudeCode: 'N',
    collectionLongitudeCode: 'W',
    bgcZoneCode: collectionData.becZone.value.code,
    bgcZoneDescription: collectionData.becZone.value.description,
    bgcSubzoneCode: collectionData.becSubzone.value.code,
    variant: collectionData.becVariant.value.code || null,
    becVersionId: seedlot?.becVersionId ?? null,
    collectionGeometryGeoJson: collectionData.collectionGeometry.value || null
  };
};

export const getBClassSeedlotPayload = (
  allStepData: BClassAllStepData,
  richSeedlotData?: RichSeedlotType
): SeedlotBClassSubmitType => ({
  seedlotFormCollectionDto: convertBClassCollection(allStepData.collectionStep, richSeedlotData),
  seedlotFormOwnershipDtoList: convertOwnership(allStepData.ownershipStep),
  seedlotFormInterimDto: convertInterim(allStepData.interimStep),
  seedlotFormExtractionDto: convertExtraction(allStepData.extractionStorageStep),
  aouSpzList: [],
  geneticWorthTraits: []
});

export const resDataToState = (
  fullFormData: SeedlotBClassFullFormType,
  defaultAgencyNumber: string,
  methodsOfPayment?: Array<MultiOptionsObj>,
  fundingSources?: Array<MultiOptionsObj>
): BClassAllStepData => {
  const collectionClient = fullFormData.collectionStep?.collectionClientNumber ?? defaultAgencyNumber;
  const ownershipList = fullFormData.ownershipStep ?? [];

  return {
    collectionStep: initBClassCollectionStateFromDto(
      collectionClient,
      fullFormData.collectionStep
    ),
    ownershipStep: initOwnershipState(
      ownershipList.length > 0 ? defaultAgencyNumber : '',
      ownershipList.length > 0 ? ownershipList : emptyOwnershipStep,
      methodsOfPayment,
      fundingSources,
      ownershipList.length > 0
    ),
    interimStep: initInterimState(
      fullFormData.interimStep?.intermStrgClientNumber ?? defaultAgencyNumber,
      fullFormData.interimStep ?? emptyInterimStep,
      fullFormData.interimStep?.intermStrgClientNumber === collectionClient
    ),
    extractionStorageStep: initExtractionStorageState(
      fullFormData.extractionStep?.extractoryClientNumber ?? tscAgencyObj.code,
      fullFormData.extractionStep?.storageClientNumber ?? tscAgencyObj.code,
      fullFormData.extractionStep ?? emptyExtractionStep,
      fullFormData.extractionStep?.extractoryClientNumber === tscAgencyObj.code,
      fullFormData.extractionStep?.storageClientNumber === tscAgencyObj.code
    )
  };
};
