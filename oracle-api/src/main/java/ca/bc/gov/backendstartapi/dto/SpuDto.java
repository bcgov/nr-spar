package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/** This class represents a JSON response when requesting SPU information from a SPU id. */
@Getter
@Setter
@Schema(description = "Represents a JSON response when requesting SPU information from a SPU id.")
public class SpuDto {
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

  @Schema(description = "The elevation band", example = "HIGH")
  private String elevationBand;

  @Schema(description = "The minimum latitude degree", example = "0")
  private Integer latitudeDegreesMin;

  @Schema(description = "The maximum latitude degree", example = "100")
  private Integer latitudeDegreesMax;

  @Schema(description = "The minimum latitude minute", example = "0")
  private Integer latitudeMinutesMin;

  @Schema(description = "The maximum latitude minute", example = "100")
  private Integer latitudeMinutesMax;

  @Schema(description = "The latitude band", example = "SOUTH")
  private String latitudeBand;
}
