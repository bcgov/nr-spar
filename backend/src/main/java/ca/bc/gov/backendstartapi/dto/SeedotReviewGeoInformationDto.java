package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

/** This record represents the Geographic Information form fields when reviewed by the TSC Admin. */
@Schema(description = "")
public record SeedotReviewGeoInformationDto(
    @Schema(
            description =
                """
                The representative elevation in meters where the seed lot originated, which is also
                the mean area of use elevation for natural stand lots. For orchard seed lots it is a
                weighted average of the contributing parent trees source elevations.
                """,
            example = "265")
        Integer meanElevation,
    @Schema(
            description =
                """
                The representative latitude where the seed lot originated, which is also the mean
                area of use latitude for natural stand lots. For orchard seed lots it is a weighted
                average of the contributing parent trees source latitudes.
                """,
            example = "18.91667")
        BigDecimal meanLatitude,
    @Schema(
            description =
                """
                The representative latitude (degrees) where the seed lot originated, which is also
                the mean area of use latitude for natural stand lots. For orchard seed lots it is a
                weighted average of the contributing parent trees source latitudes.
                """,
            example = "47")
        Integer meanLatitudeDegree,
    @Schema(
            description =
                """
              The representative latitude (minutes) where the seed lot originated, which is also
              the mean area of use latitude for natural stand lots. For orchard seed lots it is a
              weighted average of the contributing parent trees source latitudes.
              """,
            example = "43")
        Integer meanLatitudeMinute,
    @Schema(
            description =
                """
              The representative latitude (seconds) where the seed lot originated, which is also
              the mean area of use latitude for natural stand lots. For orchard seed lots it is a
              weighted average of the contributing parent trees source latitudes.
              """,
            example = "56")
        Integer meanLatitudeSecond,
    @Schema(
            description =
                """
                The representative longitude where the seed lot originated, which is also the mean
                area of use longitude for natural stand lots. For orchard seed lots it is a weighted
                average of the contributing parent trees source latitudes.
                """,
            example = "45.2")
        BigDecimal meanLongitude,
    @Schema(
            description =
                """
          The representative longitude (degrees) where the seed lot originated, which is also
          the mean area of use longitude for natural stand lots. For orchard seed lots it is a
          weighted average of the contributing parent trees source latitudes.
          """,
            example = "124")
        Integer meanLongitudeDegree,
    @Schema(
            description =
                """
          The representative longitude (minutes) where the seed lot originated, which is also
          the mean area of use longitude for natural stand lots. For orchard seed lots it is a
          weighted average of the contributing parent trees source latitudes.
          """,
            example = "31")
        Integer meanLongitudeMinute,
    @Schema(
            description =
                """
          The representative longitude (seconds) where the seed lot originated, which is also
          the mean area of use longitude for natural stand lots. For orchard seed lots it is a
          weighted average of the contributing parent trees source latitudes.
          """,
            example = "46")
        Integer meanLongitudeSecond,
    @Schema(
            description =
                """
          The calculated number of parents contributing to the Seedlot, representing the genetic
          variety.
          """,
            example = "31.9")
        BigDecimal effectivePopulationSize) {}
