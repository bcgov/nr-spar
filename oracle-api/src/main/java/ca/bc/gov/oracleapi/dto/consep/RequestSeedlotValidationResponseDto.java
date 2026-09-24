package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

/**
 * Result of checking that a seedlot number and request ID identify a real request-seedlot row,
 * for the Copy Results screen.
 *
 * <p>When a row is found its values are returned whether or not the pair is usable, so a caller
 * that rejects it can say what it found. They are null when nothing matched.
 */
@Schema(description = "Validation result for a seedlot number and request ID pair")
public record RequestSeedlotValidationResponseDto(
    @Schema(description = "True when the pair identifies a row the copy can target")
    boolean valid,

    @Schema(description = "Why the pair was rejected; empty when it was not")
    String message,

    @Schema(description = "The request item the pair resolved to", example = "TST20260001A")
    String requestItem,

    @Schema(description = "Surrogate key of the resolved request", example = "12345")
    BigDecimal requestSkey,

    @Schema(description = "Item id of the resolved request seedlot", example = "A")
    String itemId,

    @Schema(description = "Seedlot number of the resolved row", example = "00098")
    String seedlotNumber,

    @Schema(description = "Species of the resolved seedlot", example = "SX")
    String vegetationSt
) {

  /** Rejected before anything was resolved. */
  public static RequestSeedlotValidationResponseDto invalid(String message) {
    return new RequestSeedlotValidationResponseDto(false, message, null, null, null, null, null);
  }
}
