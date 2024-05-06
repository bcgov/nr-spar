package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/** This class represents a JSON response when requesting SPZ information from a SPU. */
@Getter
@Setter
@Schema(
    description =
        "Represents a JSON response when requesting SPZ + SPU-geospatial information from a SPU.")
public class SpzSpuGeoDto {
  @Schema(
      description = "A unique identifier which is assigned to a Seed Planning Unit.",
      example = "7")
  private Integer spuId;

  @Schema(
      description =
          "Minimum elevation (metres) for a specific elevation band for the Seed Planning Unit",
      example = "0")
  private Integer elevationMin;

  @Schema(
      description =
          "Maximum elevation (metres) for a specific elevation band for the Seed Planning Unit",
      example = "700")
  private Integer elevationMax;

  @Schema(
      description =
          "Maximum elevation (metres) for a specific elevation band for the Seed Planning Unit",
      example = "700")
  private Integer a;
}
