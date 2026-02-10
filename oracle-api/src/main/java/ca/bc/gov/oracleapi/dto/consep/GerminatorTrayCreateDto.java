package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * A DTO containing only the fields needed for
 * creating a new {@link ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity} instance.
 */
public record GerminatorTrayCreateDto(
    @Schema(description = "Test category code")
    @Size(max = 3)
    String testCategoryCd,

    @Schema(description = "Primary key of the activity")
    BigDecimal riaSkey
) {
}
