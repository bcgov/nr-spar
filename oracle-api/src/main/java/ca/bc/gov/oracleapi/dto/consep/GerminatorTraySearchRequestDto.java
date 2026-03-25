package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Search parameters for germ tray search screen. */
@Schema(description = "Search parameters for germ tray search")
public record GerminatorTraySearchRequestDto(
    @Schema(description = "Seedlot number (5 digits) or sample ID", example = "30350")
        @Size(max = 13, message = "Seedlot/sample ID must be at most 13 characters")
        @Pattern(
            regexp = "^(\\d{5}|[A-Za-z0-9]{1,13})$",
            message = "Enter a 5-digit seedlot number or a valid sample ID")
        String seedlotOrFamilyLot,
    @Schema(description = "Request ID or request item", example = "TST20250025B")
        @Size(max = 12, message = "Request ID/request item must be at most 12 characters")
        @Pattern(
            regexp = "^[A-Za-z0-9]*$",
            message = "Request ID/request item must be alphanumeric")
        String requestIdOrItem
) {
}
