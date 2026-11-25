package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** Body for ticking or unticking one replicate's Accept box (#2756). */
@Schema(description = "Whether a replicate is included in the germination calculations.")
public record RepAcceptedUpdateDto(
    @NotNull
    @Min(0)
    @Max(1)
    @Schema(description = "1 to include the replicate, 0 to exclude it", example = "0")
    Integer repAcceptedInd
) {}
