package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * The seedlot and request a germination test's results are copied to, from the Copy Results
 * screen.
 */
@Schema(description = "Target seedlot and request for copying germination test results")
public record CopyGerminationTestResultsDto(
    @Schema(description = "Seedlot being copied to", example = "00098")
    @NotBlank
    @Size(max = 5)
    String seedlotNumber,

    @Schema(description = "Request item (aka request ID) being copied to",
        example = "TST20260001A")
    @NotBlank
    @Size(max = 12)
    String requestId
) {
}
