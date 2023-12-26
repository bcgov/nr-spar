import { StatusColourMap } from '../components/StatusTag/definitions';
import { SingleParentTreeGeneticObj } from './ParentTreeGeneticQualityType';

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

type SeedlotStatus = {
  description: keyof typeof StatusColourMap,
  effectiveDateRange: EffectiveDateRange,
  updateTimestamp: string,
  seedlotStatusCode: string
}

/**
 * Used for seedlot table and detail page.
 */
export type SeedlotDisplayType = {
  seedlotNumber: string,
  seedlotClass: string,
  seedlotSpecies: string,
  seedlotStatus: keyof typeof StatusColourMap,
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
  revisionCount: number
}

export type SeedlotsReturnType = {
  seedlots: SeedlotType[],
  totalCount: number
}

export type SeedlotCreateResponseType = {
  seedlotNumber: string,
  seedlotStatusCode: string
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
  orchardsId: Array<string>,
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
  pollenPount: number,
  smpSuccessPct: number,
  nonOrchardPollenContamPct: number,
  amountOfMaterial: number,
  proportion: number,
  parentTreeGeneticQualities: Array<SingleParentTreeGeneticObj>
}

export type ExtractionFormSubmitType = {
  extractoryClientNumber: string,
  extractoryLocnCode: string,
  extractionStDate: string,
  extractionEndDate: string,
  storageClientNumber: string,
  storageLocnCode: string,
  temporaryStrgStartDate: string,
  temporaryStrgEndDate: string
}

export type SeedlotAClassSubmitType = {
  seedlotFormCollectionDto: CollectionFormSubmitType,
  seedlotFormOwnershipDtoList: Array<SingleOwnerFormSubmitType>,
  seedlotFormInterimDto: InterimFormSubmitType,
  seedlotFormOrchardDto: OrchardFormSubmitType,
  seedlotFormParentTreeSmpDtoList: Array<ParentTreeFormSubmitType>,
  seedlotFormExtractionDto: ExtractionFormSubmitType
}
