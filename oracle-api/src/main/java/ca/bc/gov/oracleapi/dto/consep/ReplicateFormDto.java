package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

/**
 * This record serves the purpose of mapping fields the FE should
 * send to the BE, to update a Replicate entry.
 */
@Schema(description = "JSON object with the values to be updated in the Replicate table")
public record ReplicateFormDto(
    @NotNull String containerId,
    @NotNull BigDecimal containerWeight,
    @NotNull BigDecimal freshSeed,
    @NotNull BigDecimal containerAndDryWeight,
    @NotNull BigDecimal dryWeight,
    @NotNull Integer replicateAccInd,
    @NotNull String replicateComment,
    @NotNull String overrideReason
){}
