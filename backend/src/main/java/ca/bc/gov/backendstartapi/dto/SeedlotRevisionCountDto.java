package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** This records contains the seedlot revision count number. */
@Schema(description = "This object contains the seedlot revision count number.")
public record SeedlotRevisionCountDto(
    @Schema(description = "Seedlot revision count number", example = "42") Integer revisionCount) {}
