package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** This class represents a JSON response when requesting SPZ information from a SPU. */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "represents a JSON response when requesting SPZ information from a SPU.")
public class SeedPlanZoneDto {

  @Schema(
      description = "A unique identifier which is assigned to a Seed Planning Unit.",
      example = "7")
  private Integer seedPlanUnitId;

  @Schema(
      description = "A unique identifier which is assigned to a Seed Planning Zone.",
      example = "40")
  private Integer seedPlanZoneId;

  @Schema(description = "A code describing various Genetic Classes.", example = "A")
  private Character geneticClassCode;

  @Schema(description = "A code describing various Seed Planning Zones.", example = "M")
  private String seedPlanZoneCode;

  @Schema(description = "A code describing various Vegetation Species.", example = "FDC")
  private String vegetationCode;

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
}
