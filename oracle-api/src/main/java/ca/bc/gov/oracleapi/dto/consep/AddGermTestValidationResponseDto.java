package ca.bc.gov.oracleapi.dto.consep;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Represents the result of validating a germ test activity type
 * against the current accepted A-rank germ test for a seedlot.
 *
 * @param germTest indicates whether the provided activity type code represents
 *                 a germination test
 * @param matchesCurrentTypeCode indicates whether the provided activity type code
 *                               matches the current accepted A-rank germ test
 * @param currentTypeCode the current accepted A-rank germ test activity type code;
 *                        {@code null} if no A-rank germ test exists or if the
 *                        provided type code matches
 */
@Schema(description = "Result of validating germ test activity type against current A-rank test")
public record AddGermTestValidationResponseDto(
    boolean germTest,
    boolean matchesCurrentTypeCode,
    String currentTypeCode
) {
}
