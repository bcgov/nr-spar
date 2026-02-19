package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.format.annotation.DateTimeFormat;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * A DTO containing only the fields needed for
 * creating a new {@link ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity} instance.
 */
public record GerminatorTrayCreateDto(
    @Schema(description = "Activity type code")
    @Size(max = 3)
    @NotBlank
    String activityTypeCd,

    @Schema(description = "Primary key of the activity")
    @NotNull
    BigDecimal riaSkey,

    @Schema(description = "Actual begin date of the activity")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    LocalDateTime actualBeginDtTm
) {
}
