package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

/**
 * This record serves the purpose of mapping fields the FE should
 * send to the BE, to update a Replicate entry.
 */
@Schema(description = "JSON object with the values to be updated in the Replicate table")
public record ReplicateFormDto(
    String containerId,
    BigDecimal containerWeight,
    BigDecimal freshSeed,
    BigDecimal containerAndDryWeight,
    BigDecimal dryWeight,
    Integer replicateAccInd,
    String replicateComment,
    String overrideReason
){}
