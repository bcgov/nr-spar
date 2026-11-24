package ca.bc.gov.backendstartapi.dto.oracle;

/**
 * A superior provenance (B+) from oracle-api's {@code /api/superior-provenances/{provenanceId}},
 * used to display the provenance of migrated legacy B+ seedlots.
 */
public record SuperiorProvenanceDto(
    Integer provenanceId, String vegetationCode, String provenanceDescription) {}
