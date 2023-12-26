/* eslint-disable max-len */
import {
  CollectionFormSubmitType, InterimFormSubmitType, OrchardFormSubmitType,
  ParentTreeFormSubmitType, SingleOwnerFormSubmitType, ExtractionFormSubmitType
} from '../../../types/SeedlotType';
import ExtractionStorageForm from '../../../types/SeedlotTypes/ExtractionStorage';
import { ParentTreeStepDataObj } from '../../../views/Seedlot/SeedlotRegistrationForm/definitions';
import { CollectionForm } from '../CollectionStep/definitions';
import InterimForm from '../InterimStep/definitions';
import { OrchardForm, OrchardObj } from '../OrchardStep/definitions';
import { SingleOwnerForm } from '../OwnershipStep/definitions';
import { RowDataDictType } from '../ParentTreeStep/definitions';
import { calcAverage, processOrchards } from '../ParentTreeStep/utils';

export const convertCollection = (collectionData: CollectionForm): CollectionFormSubmitType => ({
  collectionClientNumber: collectionData.collectorAgency.value.code,
  collectionLocnCode: collectionData.locationCode.value,
  collectionStartDate: collectionData.startDate.value,
  collectionEndDate: collectionData.endDate.value,
  noOfContainers: +collectionData.numberOfContainers.value,
  volPerContainer: +collectionData.volumePerContainers.value,
  clctnVolume: +collectionData.volumeOfCones.value,
  seedlotComment: collectionData.comments.value,
  coneCollectionMethodCodes: collectionData.selectedCollectionCodes.value.map((code) => parseInt(code, 10))
});

export const convertOwnership = (ownershipData: Array<SingleOwnerForm>): Array<SingleOwnerFormSubmitType> => (
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
  intermStrgStDate: interimData.startDate.value,
  intermStrgEndDate: interimData.endDate.value,
  intermOtherFacilityDesc: interimData.facilityOtherType.value,
  intermFacilityCode: interimData.facilityType.value
});

export const convertOrchard = (orchardData: OrchardForm, parentTreeRows: RowDataDictType): OrchardFormSubmitType => ({
  // This is a way of dealing with duplicated orchards
  // and make sure the value is not null
  orchardsId: processOrchards(orchardData.orchards).map((orchard: OrchardObj) => {
    if (orchard.selectedItem) {
      return orchard.selectedItem.code;
    }
    return '';
  }),
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

export const convertParentTree = (parentTreeData: ParentTreeStepDataObj, seedlotNumber: string): Array<ParentTreeFormSubmitType> => {
  const parentTreePayload: Array<ParentTreeFormSubmitType> = [];

  // Each key is a parent tree number
  Object.keys(parentTreeData.tableRowData).forEach((key: string) => {
    parentTreePayload.push({
      seedlotNumber,
      parentTreeId: parentTreeData.allParentTreeData[key].parentTreeId,
      parentTreeNumber: parentTreeData.allParentTreeData[key].parentTreeNumber,
      coneCount: +parentTreeData.tableRowData[key].coneCount.value,
      pollenPount: +parentTreeData.tableRowData[key].pollenCount.value,
      smpSuccessPct: +parentTreeData.tableRowData[key].smpSuccessPerc.value,
      nonOrchardPollenContamPct: +parentTreeData.tableRowData[key].nonOrchardPollenContam.value,
      amountOfMaterial: +parentTreeData.tableRowData[key].volume.value,
      proportion: +parentTreeData.tableRowData[key].proportion.value,
      parentTreeGeneticQualities: parentTreeData.allParentTreeData[key].parentTreeGeneticQualities
    });
  });

  return parentTreePayload;
};

export const convertExtraction = (extractionData: ExtractionStorageForm): ExtractionFormSubmitType => ({
  extractoryClientNumber: extractionData.extraction.agency.value.code,
  extractoryLocnCode: extractionData.extraction.locationCode.value,
  extractionStDate: extractionData.extraction.startDate.value,
  extractionEndDate: extractionData.extraction.endDate.value,
  storageClientNumber: extractionData.seedStorage.agency.value.code,
  storageLocnCode: extractionData.seedStorage.locationCode.value,
  temporaryStrgStartDate: extractionData.seedStorage.startDate.value,
  temporaryStrgEndDate: extractionData.seedStorage.endDate.value
});
