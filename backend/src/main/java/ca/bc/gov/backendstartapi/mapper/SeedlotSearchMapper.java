package ca.bc.gov.backendstartapi.mapper;

import ca.bc.gov.backendstartapi.dto.SeedlotSearchResultDto;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/** Maps seedlots to seedlot search result rows. A DTO field without a source fails the build. */
@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.ERROR,
    unmappedSourcePolicy = ReportingPolicy.IGNORE)
public interface SeedlotSearchMapper {

  @Mapping(target = "seedlotNumber", source = "id")
  @Mapping(target = "statusCode", source = "seedlotStatus.seedlotStatusCode")
  @Mapping(target = "statusDescription", source = "seedlotStatus.description")
  @Mapping(target = "geneticClassCode", source = "geneticClass.geneticClassCode")
  @Mapping(target = "species", source = "vegetationCode")
  @Mapping(target = "declaredUserId", source = "declarationOfTrueInformationUserId")
  @Mapping(target = "declaredAt", source = "declarationOfTrueInformationTimestamp")
  @Mapping(target = "approvedAt", source = "approvedTimestamp")
  @Mapping(target = "createdAt", source = "auditInformation.entryTimestamp")
  @Mapping(target = "updatedAt", source = "auditInformation.updateTimestamp")
  SeedlotSearchResultDto toDto(Seedlot seedlot);
}
