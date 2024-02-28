package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/** This class represents a json response object when fetching lat long data for a Parent Tree. */
@Getter
@Setter
@Schema(
    description =
        "This class represents a json response object when fetching lat long data for a Parent"
            + " Tree.")
public class ParentTreeLatLongDto {

  @Schema(description = "A unique identifier for each Parent Tree.", example = "4032")
  private Long parentTreeId;

  @Schema(
      description = "The latitude (degrees portion) where the Parent Tree originated.",
      example = "49")
  private Integer latitudeDegrees;

  @Schema(
      description = "The latitude (minutes portion) where the Parent Tree originated.",
      example = "2")
  private Integer latitudeMinutes;

  @Schema(
      description = "The latitude (seconds portion) where the Parent Tree originated.",
      example = "0")
  private Integer latitudeSeconds;

  @Schema(
      description = "The longitude (degrees portion) where the Parent Tree originated.",
      example = "124")
  private Integer longitudeDegrees;

  @Schema(
      description = "The longitude (minutes portion) where the Parent Tree originated.",
      example = "3")
  private Integer longitudeMinutes;

  @Schema(
      description = "The longitude (seconds portion) where the Parent Tree originated.",
      example = "0")
  private Integer longitudeSeconds;

  @Schema(
      description = "The elevation in meters where the Parent Tree originated.",
      example = "579")
  private Integer elevation;
}
