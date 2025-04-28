package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

/**
 * This class represents a {@link ca.bc.gov.backendstartapi.entity.consep.Replicate} object.
 */
@Schema(description = "This class represents a Replicate object.")
public record MccReplicateDto(
    @Schema(description = "RIA Key to identify the replicate data", example = "123")
    BigDecimal riaKey,

    @Schema(description = "Number identifying the replicate", example = "1")
    Integer replicateNumber,

    @Schema(description = "Identifier for the container used", example = "ABC")
    String containerId,

    @Schema(description = "Weight of the container in grams", example = "12.345")
    BigDecimal containerWeight,

    @Schema(description = "Fresh weight of the seed in grams", example = "45.678")
    BigDecimal freshSeed,

    @Schema(description = "Combined weight of the container and dry seed", example = "58.901")
    BigDecimal containerAndDryWeight,

    @Schema(description = "Dry weight of the seed in grams", example = "46.789")
    BigDecimal dryWeight,

    @Schema(description = "Indicator if the replicate is accepted", example = "1")
    Integer replicateAccInd,

    @Schema(
      description = "Comments associated with the replicate",
      example = "Replicate was re-tested 2 times"
    )
    String replicateComment,

    @Schema(description = "Reason for overriding", example = "Equipment calibration issue")
    String overrideReason
) {}
