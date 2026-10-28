package ca.bc.gov.oracleapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * One row from {@code SPAR_BIOGEOCLIMATIC_CATALOGUE} returned by the BEC catalogue endpoint.
 * Zone/subzone are always present; variant is null for zone+subzone combos that have none.
 */
@Schema(description = "A BEC zone / subzone / variant combination from the biogeoclimatic catalogue.")
public record BecCatalogueDto(
    @Schema(description = "BEC zone code.", example = "CWH") String becZoneCode,
    @Schema(description = "BEC zone name.", example = "Coastal Western Hemlock") String becZoneName,
    @Schema(description = "BEC subzone code.", example = "vm") String becSubzoneCode,
    @Schema(description = "BEC subzone name.", example = "Very Wet Maritime") String becSubzoneName,
    @Schema(description = "BEC variant code; null when none exists.", example = "1") String variant,
    @Schema(description = "BEC variant name; null when none exists.", example = "Leeward") String variantName) {}
