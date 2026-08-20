package ca.bc.gov.oracleapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Represents the seedlot and its species (vegetation code) associated with a request key. The
 * relationship between a request key and a seedlot is one-to-one.
 */
@Schema(description = "The seedlot and species associated with a request key")
public record SeedlotSpeciesDto(
    @Schema(description = "The seedlot number mapped to the request key", example = "16258")
        Long seedlotNumber,
    @Schema(
            description = "The species (vegetation code) of the seedlot",
            example = "PLI")
        String vegetationCode) {}
