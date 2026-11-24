package ca.bc.gov.oracleapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Whether a seed plan zone is coast or interior, used to pick the matching TRANSFER_LIMIT rows.
 */
@Schema(description = "Coast (C) or interior (I) classification of a seed plan zone.")
public record SeedPlanZoneCoastInteriorDto(
    @Schema(description = "Seed plan zone code.", example = "M") String seedPlanZoneCode,
    @Schema(
            description = "C when the zone is coastal; I otherwise, including unknown zones.",
            example = "C")
        String coastInteriorCode) {}
