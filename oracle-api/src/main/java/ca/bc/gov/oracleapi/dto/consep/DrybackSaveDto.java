package ca.bc.gov.oracleapi.dto.consep;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Values saved from the G64 Dryback Calculation screen. The PUT replaces the whole record,
 * so the client must send every field (a null clears it; a saved begin date cannot be
 * cleared). Calculated fields (dryback MC, 30%/35% targets) are computed by the UI and stored
 * as sent. Upper bounds match the column precision so oversize values get a 400 instead of
 * an ORA-01438; extra decimals are rounded by Oracle. Date/times must include seconds.
 */
@Schema(description = "Values to save from the G64 Dryback Calculation screen")
public record DrybackSaveDto(
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Actual begin date and time; mandatory if any other value is entered",
        example = "2025-01-15T08:30:00")
    LocalDateTime actualBeginDateTime,

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Actual end date and time", example = "2025-01-15T16:00:00")
    LocalDateTime actualEndDateTime,

    @DecimalMin("0") @DecimalMax("99.9")
    @Schema(description = "Dryback moisture content %", example = "34.4")
    BigDecimal drybackMoist,

    @DecimalMin("0") @DecimalMax("999999.999")
    @Schema(description = "Imbibed weight (g)", example = "26.438")
    BigDecimal imbibedWeight,

    @DecimalMin("0") @DecimalMax("999999.999")
    @Schema(description = "Dryback weight (g)", example = "25.080")
    BigDecimal drybackWeight,

    @DecimalMin("0") @DecimalMax("999999.999")
    @Schema(description = "StWt400 dry weight (g)", example = "17.812")
    BigDecimal dryWeight,

    @Min(0) @Max(999)
    @Schema(description = "Dryback time (minutes)", example = "65")
    Integer drybackTime,

    @DecimalMin("0") @DecimalMax("99.999")
    @Schema(description = "Target weight at 30% MC (g)", example = "23.512")
    BigDecimal targetThirtyMoist,

    @DecimalMin("0") @DecimalMax("99.999")
    @Schema(description = "Target weight at 35% MC (g)", example = "25.320")
    BigDecimal targetThirtyFiveMoist,

    @DecimalMin("0") @DecimalMax("999999.999")
    @Schema(description = "Strat end weight (g)", example = "24.100")
    BigDecimal stratEndWeight,

    @Size(max = 2000)
    String riaComment,

    @NotNull
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "The update_timestamp the client read; used for optimistic locking",
        example = "2025-01-15T16:00:00")
    LocalDateTime updateTimestamp
) {

  /** True when any value other than the comment and timestamp is entered. */
  public boolean hasData() {
    return actualEndDateTime != null || drybackMoist != null || imbibedWeight != null
        || drybackWeight != null || dryWeight != null || drybackTime != null
        || targetThirtyMoist != null || targetThirtyFiveMoist != null || stratEndWeight != null;
  }
}
