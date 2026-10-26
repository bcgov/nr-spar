package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Result of checking whether a copied germination test already exists.
 */
@Schema(description = "Validation result for duplicate germination test detection")
public record GerminationTestDuplicateValidationResponseDto(
    boolean valid,
    String message
) {
}
