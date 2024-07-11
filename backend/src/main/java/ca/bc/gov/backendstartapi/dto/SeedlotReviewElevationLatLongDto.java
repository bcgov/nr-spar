package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * This record represents the Elevation, Latitude and Longitude form fields when reviewed by the TSC
 * Admin.
 */
@Schema(
    description =
        """
        This record represents the Elevation, Latitude and Longitude field forms when reviewed by
        the TSC Admin.
        """)
public record SeedlotReviewElevationLatLongDto(
    @Schema(
            description =
                "Minimum elevation (metres) for a specific elevation band for the Seed Planning"
                    + " Unit",
            example = "1")
        Integer minElevation,
    @Schema(
            description =
                "Maximum elevation (metres) for a specific elevation band for the Seed Planning"
                    + " Unit",
            example = "1")
        Integer maxElevation,
    @Schema(description = "The minimum latitude degree", example = "48") Integer minLatitudeDeg,
    @Schema(description = "The minimum latitude minutes", example = "00") Integer minLatitudeMin,
    @Schema(description = "The minimum latitude seconds", example = "00") Integer minLatitudeSec,
    @Schema(description = "The maximum latitude degree", example = "52") Integer maxLatitudeDeg,
    @Schema(description = "The maximum latitude minutes", example = "00") Integer maxLatitudeMin,
    @Schema(description = "The maximum latitude seconds", example = "52") Integer maxLatitudeSec,
    @Schema(description = "The minimum longitude degree", example = "124") Integer minLongitudeDeg,
    @Schema(description = "The minimum longitude minutes", example = "31") Integer minLongitudeMin,
    @Schema(description = "The minimum longitude seconds", example = "46") Integer minLongitudeSec,
    @Schema(description = "The maximum longitude degree", example = "124") Integer maxLongitudeDeg,
    @Schema(description = "The maximum longitude minutes", example = "31") Integer maxLongitudeMin,
    @Schema(description = "The maximum longitude seconds", example = "46") Integer maxLongitudeSec,
    @Schema(description = "Open field to be adding relevant comments") String areaOfUseComment) {}
