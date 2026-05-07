package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response DTO for test-rank determination.
 * Contains the suggested rank for the current test in a seedlot.
 * The rank is "A", "P", or null when rank assignment does not apply.
 */
@Schema(description = "Response containing the suggested test rank for a seedlot")
public record TestRankResponseDto(
    @Schema(description = "Suggested test rank", example = "A", nullable = true)
    String rank
) {
}
