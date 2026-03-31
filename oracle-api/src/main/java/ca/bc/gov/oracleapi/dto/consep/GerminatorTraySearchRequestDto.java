package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Search parameters for germ tray search screen. */
@Schema(description = "Search parameters for germ tray search")
public record GerminatorTraySearchRequestDto(
    @Schema(description = "Seedlot number (5 digits) or family lot", example = "30350")
        @Size(max = 13, message = "Seedlot/family lot must be at most 13 characters")
        @Pattern(
            regexp = "^\\s*(?:\\d{5}|F[A-Za-z0-9]{1,12})\\s*$",
            message = "Enter a 5-digit seedlot number or a valid family lot")
        String seedlotOrFamilyLot,
    @Schema(
            description = "Request ID (11 chars) or request item (12 chars)",
            example = "TST20250025B")
        @Pattern(
            regexp = "^\\s*[A-Za-z0-9]{11,12}\\s*$",
            message = "Request ID/request item must be 11 or 12 alphanumeric characters")
        String requestIdOrItem
) {
}
