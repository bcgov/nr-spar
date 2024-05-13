package ca.bc.gov.backendstartapi.dto.Oracle;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/** This class represents a JSON response when requesting SPZ information from a SPU. */
@Getter
@Setter
@Schema(description = "A dto object that contains info of a seed plan zone.")
public class SpzDto {
  @Schema(description = "The SPZ code", example = "EK")
  private String code;

  @Schema(description = "A code describing various Seed Planning Zones.", example = "East Kootenay")
  private String description;

  @Schema(description = "Whether this spz is the primary spz.", example = "true")
  private Boolean isPrimary;
}
