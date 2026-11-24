package ca.bc.gov.oracleapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * B+ superior provenance option for the collection provenance dropdown.
 *
 * <p>Filtered server-side by vegetation code and effective/expiry dates; those filter columns are
 * not exposed on the wire.
 */
@Schema(description = "A superior provenance option for a species.")
public record SuperiorProvenanceDto(
    @Schema(description = "Provenance identifier (stored on the seedlot).", example = "1")
        Integer provenanceId,
    @Schema(description = "Species vegetation code.", example = "FDC") String vegetationCode,
    @Schema(description = "Display name for the provenance dropdown.", example = "Fraser Valley")
        String provenanceDescription) {}
