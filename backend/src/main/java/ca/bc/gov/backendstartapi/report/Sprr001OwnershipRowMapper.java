package ca.bc.gov.backendstartapi.report;

import ca.bc.gov.backendstartapi.dto.SeedlotFormOwnershipDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/** Maps ownership form rows onto the SPRR001 ownership Jasper bean. */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface Sprr001OwnershipRowMapper {

  @Mapping(target = "clientNumber", source = "owner.ownerClientNumber")
  @Mapping(target = "clientLocnCode", source = "owner.ownerLocnCode")
  @Mapping(target = "clientAcronym", source = "client.acronym")
  @Mapping(target = "clientName", source = "client.name")
  @Mapping(target = "ownerPortionPct", source = "owner.originalPctOwned")
  @Mapping(target = "reservedPct", source = "owner.originalPctRsrvd")
  @Mapping(target = "surplusPct", source = "owner.originalPctSrpls")
  @Mapping(target = "fundingSource", source = "owner.sparFundSrceCode")
  @Mapping(target = "sparFundSrceDesc", source = "fundingDescription")
  @Mapping(target = "methodOfPaymentCode", source = "owner.methodOfPaymentCode")
  @Mapping(target = "methodOfPaymentDesc", source = "paymentDescription")
  Sprr001OwnershipRow toRow(
      SeedlotFormOwnershipDto owner,
      ClientDisplay client,
      String paymentDescription,
      String fundingDescription);
}
