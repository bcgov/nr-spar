package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

/** This class represents the JSON request body when doing parent tree and SMP calculations. */
@Schema(
    description =
        "An object representing the request body for the parent tree and SMP values calculations.")
public record PtValsCalReqDto(
    @NotNull List<OrchardParentTreeValsDto> orchardPtVals,
    @NotNull List<GeospatialRequestDto> smpMixIdAndProps,
    @NotNull Integer smpParentsOutside,
    BigDecimal contaminantPollenBv,
    SeedlotManagementBreedingValueDto smpBv) {}
