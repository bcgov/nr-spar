package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

/**
 * This class represents a {@link ca.bc.gov.backendstartapi.entity.consep.PurityReplicate} object.
 */
@Schema(description = "This class represents a purity replicate object.")
public record PurityReplicateDto(
    @Schema(description = "RIA Key to identify the replicate data", example = "123")
    BigDecimal riaKey,

    @Schema(description = "Number identifying the replicate", example = "1")
    Integer replicateNumber,

    @Schema(description = "Weight of seed, in grams, when all debris and impurities are removed", example = "1.23")
    BigDecimal pureSeedWeight,

    @Schema(description = "Weight of other seeds of a different species that are removed from the seed sample, in grams", example = "4.23")
    BigDecimal otherSeedWeight,

    @Schema(description = "The weight of all debris and impurities that are removed from the seed, in grams", example = "5.23")
    BigDecimal containerWeight,

    @Schema(description = "Indicator if the replicate is accepted", example = "1")
    Integer replicateAccInd,

    @Schema(description = "Reason for overriding", example = "Equipment calibration issue")
    String overrideReason
) {}
