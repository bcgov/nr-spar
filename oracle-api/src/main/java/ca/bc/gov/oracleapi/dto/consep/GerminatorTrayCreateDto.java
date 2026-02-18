package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * A DTO containing only the fields needed for
 * creating a new {@link ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity} instance.
 */
public record GerminatorTrayCreateDto(
    @Schema(description = "Activity type code")
    @Size(max = 3)
    String activityTypeCd,

    @Schema(description = "Primary key of the activity")
    BigDecimal riaSkey,

    @Schema(description = "Actual begin date of the activity")
    LocalDateTime actualBeginDtTm
) {
}
