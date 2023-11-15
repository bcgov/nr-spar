import { StatusColourMap } from '../components/StatusTag/definitions';

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
