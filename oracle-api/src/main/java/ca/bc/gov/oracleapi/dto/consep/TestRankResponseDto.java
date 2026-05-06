package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response containing the suggested test rank for a seedlot")
public record TestRankResponseDto(
    @Schema(description = "Suggested test rank", example = "A", nullable = true)
    String rank
) {
}
