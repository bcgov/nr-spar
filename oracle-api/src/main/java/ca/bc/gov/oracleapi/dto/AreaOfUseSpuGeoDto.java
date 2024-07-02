package ca.bc.gov.oracleapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * This class represents a JSON response when requesting Geo information from a SPU id for Area of
 * Use.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(
    description =
        "Represents a JSON response when requesting Geo information from a SPU id for Area of Use.")
public class AreaOfUseSpuGeoDto {
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

  @Schema(description = "The minimum latitude degree", example = "0")
  private Integer latitudeDegreesMin;

  @Schema(description = "The maximum latitude degree", example = "100")
  private Integer latitudeDegreesMax;

  @Schema(description = "The minimum latitude minute", example = "0")
  private Integer latitudeMinutesMin;

  @Schema(description = "The maximum latitude minute", example = "100")
  private Integer latitudeMinutesMax;
}
