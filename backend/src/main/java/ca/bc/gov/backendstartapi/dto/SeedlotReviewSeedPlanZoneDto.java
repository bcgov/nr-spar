package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** This record represent one Seed Planning Zone code and its primary definition. */
@Schema(
    description =
        """
        Holds Area Of Use values possibly changed by the TSC Admin when reviewing the Seedlot"
        registration.""")
public record SeedlotReviewSeedPlanZoneDto(
    @Schema(description = "Seed Planning Zone code", example = "PG") String code,
    @Schema(
            description = "A code describing various Seed Planning Zones.",
            example = "Prince George")
        String description,
    @Schema(
            description = "Defines if the code is whether primary or not.",
            example = "true",
            nullable = true)
        Boolean isPrimary) {}
