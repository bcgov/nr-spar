package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

/**
 * This class represents a {@link ca.bc.gov.backendstartapi.entity.consep.PurityDebrisEntity}.
 */
@Schema(description = "This class represents a purity debris object.")
public record PurityDebrisDto(
    @Schema(description = "RIA Key to identify the debris data", example = "123")
    BigDecimal riaKey,

    @Schema(
      description = "Number identifying the replicate to which the debris is associated",
      example = "1")
    Integer replicateNumber,

    @Schema(description = "Value which is used to order the types of debris", example = "1.23")
    BigDecimal debrisSeqNumber,

    @Schema(description = "Provides a means of ordering debris", example = "1")
    Integer debrisRank,

    @Schema(description = "A code which represents a type of debris.", example = "STD")
    String debrisTypeCode
) {}
