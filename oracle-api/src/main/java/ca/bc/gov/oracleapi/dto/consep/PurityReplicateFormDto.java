package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

/**
 * This record serves the purpose of mapping fields the FE should
 * send to the BE, to update a purity replicate entry.
 */
@Schema(description = "JSON object with the values to be updated in the purity replicate table")
public record PurityReplicateFormDto(
    @NotNull Integer replicateNumber,
    BigDecimal pureSeedWeight,
    BigDecimal otherSeedWeight,
    BigDecimal containerWeight,
    @NotNull Integer replicateAccInd,
    String overrideReason
){}
