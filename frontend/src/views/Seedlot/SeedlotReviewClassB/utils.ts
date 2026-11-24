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
  becCatalogue?: BecCatalogueItem[],
  isBcSource = false
): boolean => {
  const {
    collectionStep, ownershipStep, interimStep, extractionStorageStep
  } = allStepData;

  if (validateBClassCollectionStep(collectionStep, becCatalogue)
    || !verifyBClassCollectionStepCompleteness(collectionStep, becCatalogue, isBcSource)) {
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
 * preserving the area-of-use data (SPZ slots, elevation and lat/long ranges)
 * and genetic worth values already stored on the seedlot, since those are
 * calculated at submission and not editable on this screen.
 *
 * The area of use comment is the one exception: TSC admins can edit it here.
 * Pass the edited value as areaOfUseComment; when it is undefined the stored
 * comment is kept.
 */
export const buildBClassReviewPayload = (
  allStepData: BClassAllStepData,
  richSeedlotData?: RichSeedlotType,
  areaOfUseComment?: string
): SeedlotBClassSubmitType => {
  const payload = getBClassSeedlotPayload(allStepData, richSeedlotData);
  const seedlot = richSeedlotData?.seedlot;
  const collectionDto = payload.seedlotFormCollectionDto;

  // When a loaded seedlot is present, copy AOU and provenance fields
  // verbatim (including null) so review saves do not invent AOU bounds or
  // downgrade / normalize stored null indicators.
  const preservedCollectionFields = seedlot
    ? {
      areaOfUseComment: seedlot.areaOfUseComment ?? null,
      elevationMin: seedlot.elevationMin,
      elevationMax: seedlot.elevationMax,
      latitudeDegMin: seedlot.latitudeDegMin,
      latitudeMinMin: seedlot.latitudeMinMin,
      latitudeSecMin: seedlot.latitudeSecMin,
      latitudeDegMax: seedlot.latitudeDegMax,
      latitudeMinMax: seedlot.latitudeMinMax,
      latitudeSecMax: seedlot.latitudeSecMax,
      longitudeDegMin: seedlot.longitudeDegMin,
      longitudeMinMin: seedlot.longitudeMinMin,
      longitudeSecMin: seedlot.longitudeSecMin,
      longitudeDegMax: seedlot.longitudeDegMax,
      longitudeMinMax: seedlot.longitudeMinMax,
      longitudeSecMax: seedlot.longitudeSecMax,
      provenanceId: seedlot.provenanceId
        ?? richSeedlotData?.bClassDetail?.provenanceId
        ?? null,
      becVersionId: seedlot.becVersionId,
      // Owned by the collection area map; round-tripped here so a resave preserves it.
      becOverrideInd: seedlot.becOverrideInd ?? false,
      becOverrideComment: seedlot.becOverrideComment ?? null
    }
    : {};

  const editedComment = areaOfUseComment === undefined
    ? {}
    : { areaOfUseComment: areaOfUseComment.trim() || null };

  return {
    ...payload,
    seedlotFormCollectionDto: {
      ...collectionDto,
      ...preservedCollectionFields,
      ...editedComment
    },
    aouSpzList: richSeedlotData?.bClassDetail?.aouSpzList ?? []
  };
};

export const formatDms = (deg: string, min: string, sec: string): string => (
  deg || min || sec ? `${deg}° ${min}' ${sec}"` : ''
);
