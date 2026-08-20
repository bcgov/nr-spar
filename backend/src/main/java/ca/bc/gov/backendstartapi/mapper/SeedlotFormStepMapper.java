package ca.bc.gov.backendstartapi.mapper;

import ca.bc.gov.backendstartapi.dto.SeedlotFormExtractionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormInterimDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOwnershipDto;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOwnerQuantity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * Maps shared A/B form-step DTOs from seedlot entities. Collection stays on {@link
 * SeedlotFormCollectionBclassMapper} because those field names and save rules are B-class
 * specific.
 */
@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.ERROR,
    unmappedSourcePolicy = ReportingPolicy.IGNORE)
public interface SeedlotFormStepMapper {

  @Mapping(target = "intermStrgClientNumber", source = "interimStorageClientNumber")
  @Mapping(target = "intermStrgLocnCode", source = "interimStorageLocationCode")
  @Mapping(target = "intermStrgStDate", source = "interimStorageStartDate")
  @Mapping(target = "intermStrgEndDate", source = "interimStorageEndDate")
  @Mapping(target = "intermOtherFacilityDesc", source = "interimStorageOtherFacilityDesc")
  @Mapping(target = "intermFacilityCode", source = "interimStorageFacilityCode")
  SeedlotFormInterimDto toInterimDto(Seedlot seedlot);

  @Mapping(target = "extractoryClientNumber", source = "extractionClientNumber")
  @Mapping(target = "extractoryLocnCode", source = "extractionLocationCode")
  @Mapping(target = "extractionStDate", source = "extractionStartDate")
  @Mapping(target = "extractionEndDate", source = "extractionEndDate")
  @Mapping(target = "storageLocnCode", source = "storageLocationCode")
  @Mapping(target = "temporaryStrgStartDate", source = "temporaryStorageStartDate")
  @Mapping(target = "temporaryStrgEndDate", source = "temporaryStorageEndDate")
  SeedlotFormExtractionDto toExtractionDto(Seedlot seedlot);

  @Mapping(target = "ownerLocnCode", source = "ownerLocationCode")
  @Mapping(target = "originalPctOwned", source = "originalPercentageOwned")
  @Mapping(target = "originalPctRsrvd", source = "originalPercentageReserved")
  @Mapping(target = "originalPctSrpls", source = "originalPercentageSurplus")
  @Mapping(target = "methodOfPaymentCode", source = "methodOfPayment.methodOfPaymentCode")
  @Mapping(target = "sparFundSrceCode", source = "fundingSourceCode")
  SeedlotFormOwnershipDto toOwnershipDto(SeedlotOwnerQuantity owner);
}
