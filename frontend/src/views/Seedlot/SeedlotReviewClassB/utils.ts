import { BecCatalogueItem } from '../../../api-service/becCatalogueAPI';
import {
  RichSeedlotType,
  SeedlotBClassSubmitType
} from '../../../types/SeedlotType';
import {
  validateBClassCollectionStep,
  verifyBClassCollectionStepCompleteness
} from '../../../components/SeedlotRegistrationSteps/BClassCollectionStep/utils';
import {
  validateOwnershipStep,
  verifyOwnershipStepCompleteness,
  validateInterimStep,
  verifyInterimStepCompleteness,
  validateExtractionStep,
  verifyExtractionStepCompleteness
} from '../ContextContainerClassA/utils';
import { BClassAllStepData } from '../ContextContainerClassB/definitions';
import { getBClassSeedlotPayload } from '../ContextContainerClassB/utils';

/**
 * Validates all B-class form steps before a review save.
 * Returns true when every step is valid and complete.
 */
export const validateBClassReviewForm = (
  allStepData: BClassAllStepData,
  becCatalogue?: BecCatalogueItem[]
): boolean => {
  const {
    collectionStep, ownershipStep, interimStep, extractionStorageStep
  } = allStepData;

  if (validateBClassCollectionStep(collectionStep, becCatalogue)
    || !verifyBClassCollectionStepCompleteness(collectionStep, becCatalogue)) {
    return false;
  }

  if (validateOwnershipStep(ownershipStep)
    || !verifyOwnershipStepCompleteness(ownershipStep)) {
    return false;
  }

  if (validateInterimStep(interimStep)
    || !verifyInterimStepCompleteness(interimStep)) {
    return false;
  }

  if (validateExtractionStep(extractionStorageStep)
    || !verifyExtractionStepCompleteness(extractionStorageStep)) {
    return false;
  }

  return true;
};

/**
 * Builds the b-class-submission payload for a TSC review save,
 * preserving the area-of-use data (SPZ slots, comment, elevation and
 * lat/long ranges) and genetic worth values already stored on the seedlot,
 * since those are calculated at submission and not editable on this screen.
 */
export const buildBClassReviewPayload = (
  allStepData: BClassAllStepData,
  richSeedlotData?: RichSeedlotType
): SeedlotBClassSubmitType => {
  const payload = getBClassSeedlotPayload(allStepData, richSeedlotData);
  const seedlot = richSeedlotData?.seedlot;
  const collectionDto = payload.seedlotFormCollectionDto;

  return {
    ...payload,
    seedlotFormCollectionDto: {
      ...collectionDto,
      areaOfUseComment: seedlot?.areaOfUseComment ?? null,
      elevationMin: seedlot?.elevationMin ?? collectionDto.elevationMin,
      elevationMax: seedlot?.elevationMax ?? collectionDto.elevationMax,
      latitudeDegMin: seedlot?.latitudeDegMin ?? collectionDto.latitudeDegMin,
      latitudeMinMin: seedlot?.latitudeMinMin ?? collectionDto.latitudeMinMin,
      latitudeSecMin: seedlot?.latitudeSecMin ?? collectionDto.latitudeSecMin,
      latitudeDegMax: seedlot?.latitudeDegMax ?? collectionDto.latitudeDegMax,
      latitudeMinMax: seedlot?.latitudeMinMax ?? collectionDto.latitudeMinMax,
      latitudeSecMax: seedlot?.latitudeSecMax ?? collectionDto.latitudeSecMax,
      longitudeDegMin: seedlot?.longitudeDegMin ?? collectionDto.longitudeDegMin,
      longitudeMinMin: seedlot?.longitudeMinMin ?? collectionDto.longitudeMinMin,
      longitudeSecMin: seedlot?.longitudeSecMin ?? collectionDto.longitudeSecMin,
      longitudeDegMax: seedlot?.longitudeDegMax ?? collectionDto.longitudeDegMax,
      longitudeMinMax: seedlot?.longitudeMinMax ?? collectionDto.longitudeMinMax,
      longitudeSecMax: seedlot?.longitudeSecMax ?? collectionDto.longitudeSecMax
    },
    aouSpzList: richSeedlotData?.bClassDetail?.aouSpzList ?? [],
    geneticWorthTraits: (richSeedlotData?.calculatedValues ?? []).map((trait) => ({
      traitCode: trait.traitCode,
      traitValue: trait.traitValue,
      calculatedValue: trait.calculatedValue,
      testedParentTreePerc: trait.testedParentTreePerc
    }))
  };
};

export const formatDms = (deg: string, min: string, sec: string): string => (
  deg || min || sec ? `${deg}° ${min}' ${sec}"` : ''
);
