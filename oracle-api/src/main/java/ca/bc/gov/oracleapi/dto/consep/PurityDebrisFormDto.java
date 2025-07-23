package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

/**
 * This record serves the purpose of mapping fields the FE should
 * send to the BE, to update a purity debris entry.
 */
@Schema(description = "JSON object with the values to be updated in the purity debris table")
public record PurityDebrisFormDto(
    @NotNull Integer replicateNumber,
    @NotNull Integer debrisRank,
    @NotNull String debrisTypeCode
){}
