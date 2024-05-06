package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/** This class represents a JSON response when requesting SPZ information from a SPU. */
@Getter
@Setter
@Schema(description = "A dto object that contains info of a seed plan zone.")
public class SpzDto {
  @Schema(
      description = "A unique identifier which is assigned to a Seed Planning Zone.",
      example = "40")
  private Integer spzId;

  @Schema(description = "A code describing various Genetic Classes.", example = "A")
  private Character geneticClassCode;

  @Schema(description = "The SPZ code", example = "M")
  private String spzCode;

  @Schema(description = "A code describing various Seed Planning Zones.", example = "M")
  private String spzDescription;

  @Schema(description = "Whether this spz is the primary spz.", example = "true")
  private String isSpzPrimary;
}
