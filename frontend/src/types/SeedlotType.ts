import { StatusColourMap } from '../components/StatusTag/definitions';
import { AllStepData, ProgressIndicatorConfig } from '../views/Seedlot/ContextContainerClassA/definitions';
import { CodeDescResType } from './CodeDescResType';
import { SingleParentTreeGeneticObj } from './ParentTreeGeneticQualityType';
import { GeneticTrait, MeanGeomDataType } from './PtCalcTypes';
import { SeedlotPatchPayloadType } from './SeedlotRegistrationTypes';
import { SpuDto } from './SpuDto';

type EffectiveDateRange = {
  effectiveDate: string,
  expiryDate: string
}

type GeneticClass = {
  description: string,
  effectiveDateRange: EffectiveDateRange,
  updateTimestamp: string,
  geneticClassCode: string
}

export type SeedlotStatusCode = 'APP' | 'CAN' | 'COM' | 'EXP' | 'INC' | 'PND' | 'SUB';

type SeedlotStatus = {
  description: keyof typeof StatusColourMap,
  effectiveDateRange: EffectiveDateRange,
  updateTimestamp: string,
  seedlotStatusCode: SeedlotStatusCode
}

/**
 * Used for seedlot table and detail page.
 */
export type SeedlotDisplayType = {
  seedlotNumber: string,
  seedlotClass: string,
  seedlotSpecies: string,
  seedlotStatus: keyof typeof StatusColourMap,
  entryUserId: string,
  entryTimestamp: string,
  applicantAgency: string,
  locationCode: string,
  createdAt: string,
  lastUpdatedAt: string,
  approvedAt: string
}

/**
 * Used for seedlot applicant information
 */
export type SeedlotApplicantType = {
  agency: string,
  locationCode: string,
  email: string,
  species: string,
  source: string,
  willRegister: boolean,
  isBcSource: boolean
}

/**
 * Data def from backend
 */
export type SeedlotType = {
  id: string, // seedlot number
  seedlotStatus: SeedlotStatus,
  comment: string,
  applicantClientNumber: string,
  applicantLocationCode: string,
  applicantEmailAddress: string,
  vegetationCode: string,
  geneticClass: GeneticClass,
  seedlotSource: {
    seedlotSourceCode: string,
    description: string,
    isDefault: boolean
  },
  intendedForCrownLand: boolean,
  sourceInBc: boolean,
  collectionClientNumber: string,
  collectionLocationCode: string,
  collectionStartDate: string,
  collectionEndDate: string,
  numberOfContainers: number,
  containerVolume: number,
  totalConeVolume: number,
  interimStorageClientNumber: string,
  interimStorageLocationCode: string,
  interimStorageStartDate: string,
  interimStorageEndDate: string,
  interimStorageFacilityCode: string,
  femaleGameticContributionMethod: string,
  maleGameticContributionMethod: string,
  producedThroughControlledCross: boolean,
  producedWithBiotechnologicalProcesses: boolean,
  pollenContaminationPresentInOrchard: boolean,
  pollenContaminationPercentage: number,
  pollenContaminantBreedingValue: number,
  pollenContaminationMethodCode: string,
  totalParentTrees: number,
  smpSuccessPercentage: number,
  effectivePopulationSize: number,
  testedParentTreeContributionPercentage: number,
  coancestry: number,
  parentsOutsideTheOrchardUsedInSmp: number,
  nonOrchardPollenContaminationPercentage: number,
  extractionClientNumber: string,
  extractionLocationCode: string,
  extractionStartDate: string,
  extractionEndDate: string,
  storageClientNumber: string,
  storageLocationCode: string,
  temporaryStorageStartDate: string,
  temporaryStorageEndDate: string,
  declarationOfTrueInformationUserId: string,
  declarationOfTrueInformationTimestamp: string,
  auditInformation: {
    entryUserId: string,
    entryTimestamp: string,
    updateUserId: string,
    updateTimestamp: string
  },
  revisionCount: number,
  seedPlanUnitId: number,
  bgcZoneCode: string | null,
  bgcZoneDescription: string | null,
  bgcSubzoneCode: string | null,
  variant: string | null,
  becVersionId: number | null,
  elevation: number | null,
  latitudeDegrees: number | null,
  latitudeMinutes: number | null,
  latitudeSeconds: number | null,
  longitudeDegrees: number | null,
  longitudeMinutes: number | null,
  longitudeSeconds: number | null,
  collectionElevation: number | null,
  collectionElevationMin: number | null,
  collectionElevationMax: number | null,
  collectionLatitudeDeg: number | null,
  collectionLatitudeMin: number | null,
  collectionLatitudeSec: number | null,
  collectionLatitudeCode: string | null,
  collectionLongitudeDeg: number | null,
  collectionLongitudeMin: number | null,
  collectionLongitudeSec: number | null,
  collectionLongitudeCode: string | null,
  elevationMin: number | null,
  elevationMax: number | null,
  latitudeDegMin: number | null,
  latitudeMinMin: number | null,
  latitudeSecMin: number | null,
  latitudeDegMax: number | null,
  latitudeMinMax: number | null,
  latitudeSecMax: number | null,
  longitudeDegMin: number | null,
  longitudeMinMin: number | null,
  longitudeSecMin: number | null,
  longitudeDegMax: number | null,
  longitudeMinMax: number | null,
  longitudeSecMax: number | null,
  smpMeanBvGrowth: number,
  areaOfUseComment: string | null,
  approvedUserId: string | null,
  approvedTimestamp: string | null,
}

export type SeedPlanZoneDto = {
  isPrimary: boolean
} & CodeDescResType;

export type SeedPlanZoneOracleDto = {
  effectiveDate: string,
  expiryDate: string
} & CodeDescResType;

export type SeedlotCalculationsResultsType = {
  traitCode: string,
  traitValue: number,
  calculatedValue: number,
  testedParentTreePerc: number
}

/**
 * The seedlot data returned from backend that contains additional information
 * such as seed plan zone.
 */
export type RichSeedlotType = {
  seedlot: SeedlotType,
  primarySpu: SpuDto | null,
  primarySpz: SeedPlanZoneDto | null,
  additionalSpzList: SeedPlanZoneDto[],
  calculatedValues: SeedlotCalculationsResultsType[]
}

export type SeedlotsReturnType = {
  seedlots: SeedlotType[],
  totalCount: number
}

export type SeedlotCreateResponseType = {
  seedlotNumber: string,
  seedlotStatusCode: SeedlotStatusCode
}

export type CollectionFormSubmitType = {
  collectionClientNumber: string,
  collectionLocnCode: string,
  collectionStartDate: string,
  collectionEndDate: string,
  noOfContainers: number,
  volPerContainer: number,
  clctnVolume: number,
  seedlotComment: string,
  coneCollectionMethodCodes: Array<number>
}

export type SingleOwnerFormSubmitType = {
  ownerClientNumber: string,
  ownerLocnCode: string,
  originalPctOwned: number,
  originalPctRsrvd: number,
  originalPctSrpls: number,
  methodOfPaymentCode: string,
  sparFundSrceCode: string
}

export type InterimFormSubmitType = {
  intermStrgClientNumber: string,
  intermStrgLocnCode: string,
  intermStrgStDate: string,
  intermStrgEndDate: string,
  intermOtherFacilityDesc: string,
  intermFacilityCode: string
}

export type OrchardFormSubmitType = {
  primaryOrchardId: string | null,
  secondaryOrchardId: string | null,
  femaleGameticMthdCode: string,
  maleGameticMthdCode: string,
  controlledCrossInd: boolean,
  biotechProcessesInd: boolean,
  pollenContaminationInd: boolean,
  pollenContaminationPct: number,
  contaminantPollenBv: number,
  pollenContaminationMthdCode: string
}

export type ParentTreeFormSubmitType = {
  seedlotNumber: string,
  parentTreeId: number,
  parentTreeNumber: string,
  coneCount: number,
  pollenCount: number,
  smpSuccessPct: number,
  nonOrchardPollenContamPct: number,
  amountOfMaterial: number,
  proportion: number,
  parentTreeGeneticQualities: Array<SingleParentTreeGeneticObj>
}

export type SeedlotFormSmpParentOutsideType = {
  smpParentsOutside: number
}

export type ExtractionFormSubmitType = {
  extractoryClientNumber: string,
  extractoryLocnCode: string,
  extractionStDate: string | null,
  extractionEndDate: string | null,
  storageClientNumber: string,
  storageLocnCode: string,
  temporaryStrgStartDate: string | null
  temporaryStrgEndDate: string | null
}

export type SeedlotAClassSubmitType = {
  seedlotFormCollectionDto: CollectionFormSubmitType,
  seedlotFormOwnershipDtoList: Array<SingleOwnerFormSubmitType>,
  seedlotFormInterimDto: InterimFormSubmitType,
  seedlotFormOrchardDto: OrchardFormSubmitType,
  seedlotFormParentTreeDtoList: Array<ParentTreeFormSubmitType>,
  seedlotFormParentTreeSmpDtoList: Array<ParentTreeFormSubmitType>,
  seedlotFormSmpParentOutsideDto: SeedlotFormSmpParentOutsideType,
  seedlotFormExtractionDto: ExtractionFormSubmitType
}

export type SeedlotReviewElevationLatLongDto = {
  minElevation: number,
  maxElevation: number,
  minLatitudeDeg: number,
  minLatitudeMin: number,
  minLatitudeSec: number,
  maxLatitudeDeg: number,
  maxLatitudeMin: number,
  maxLatitudeSec: number,
  minLongitudeDeg: number,
  minLongitudeMin: number,
  minLongitudeSec: number,
  maxLongitudeDeg: number,
  maxLongitudeMin: number,
  maxLongitudeSec: number,
  areaOfUseComment: string
}

export type SeedlotReviewGeoInformationDto = MeanGeomDataType & {
  effectivePopulationSize: number
}

export type TscSeedlotEditPayloadType = SeedlotAClassSubmitType & {
  applicantAndSeedlotInfo: SeedlotPatchPayloadType,
  seedlotReviewSeedPlanZones: SeedPlanZoneDto[],
  seedlotReviewElevationLatLong: SeedlotReviewElevationLatLongDto,
  seedlotReviewGeneticWorth: GeneticTrait[],
  seedlotReviewGeoInformation: SeedlotReviewGeoInformationDto
}

export type SeedlotProgressPayloadType = {
  allStepData: AllStepData,
  progressStatus: ProgressIndicatorConfig,
  revisionCount: number
};

export type SeedlotAClassFullResponseType = {
  seedlotData: SeedlotAClassSubmitType,
  calculatedValues: Array<SeedlotCalculationsResultsType>
}
