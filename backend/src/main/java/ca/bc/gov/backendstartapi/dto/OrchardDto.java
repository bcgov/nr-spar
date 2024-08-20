package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * This record represents the OrchardLotTypeDescriptionDto object found in the oracle-api service.
 */
@Schema(description = "Represents an Orchard object received from oracle-api except spuId.")
@Getter
@Setter
public class OrchardDto {
  @Schema(
      description =
          """
                A unique identifier which is assigned to a location where cuttings or
                A class seed is produced.
                """,
      example = "339")
  private String id;

  @Schema(
      description = "The name of a location where cuttings or A class seed is produced.",
      example = "EAGLEROCK")
  private String name;

  @Schema(description = "A code which represents a species of tree or brush.", example = "PLI")
  private String vegetationCode;

  @Schema(
      description =
          """
                A code representing a type of orchard. The two values will be 'S' (Seed Lot) or
                'C' (Cutting Lot).
                """,
      example = "S")
  private Character lotTypeCode;

  @Schema(
      description =
          """
                A description of the Orchard Lot Type code. The two values will be 'Seed Lot'
                or 'Cutting Lot'.
                """,
      example = "Seed Lot")
  private String lotTypeDescription;

  @Schema(
      description = "A code which represents the current stage or status of an orchard.",
      example = "PRD")
  private String stageCode;

  @Schema(description = "The bgc zone code", example = "SBS")
  private String becZoneCode;

  @Schema(description = "The description of a bgc zone code", example = "Sub-Boreal Spruce")
  private String becZoneDescription;

  @Schema(description = "The bgc sub-zone code", example = "wk")
  private String becSubzoneCode;

  @Schema(description = "The variant.", example = "1")
  private Character variant;

  @Schema(description = "The bec version id.", example = "5")
  private Integer becVersionId;

  @Schema(description = "Seed Plan Unit id", example = "7")
  private Integer spuId;
}
