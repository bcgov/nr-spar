package ca.bc.gov.backendstartapi.dto;

import java.util.ArrayList;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * This class holds the fields that will be returned when requesting a ParentTree
 * from an Orchard.
 */
@Getter
@Setter
@ToString
public class OrchardParentTreeDto {
  
  @Schema(
      description =
          """
          A unique identifier which is assigned to a location where cuttings or A class seed is
          produced.
          """,
      example = "405")
  private String orchardId;

  @Schema(description = "A code describing various Vegetation Species.", example = "ACT")
  private String vegetationCode;

  @Schema(
      description = "A unique identifier which is assigned to a Seed Planning Unit.",
      example = "7")
  private Long seedPlanningUnitId;

  private List<ParentTreeDto> parentTrees;

  public OrchardParentTreeDto() {
    this.parentTrees = new ArrayList<>();
  }
}
