package ca.bc.gov.oracleapi.dto;

import ca.bc.gov.oracleapi.entity.spar.ParentTreeEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * This class holds the fields that will be returned when requesting a {@link
 * ParentTreeEntity} from an {@link
 * ca.bc.gov.oracleapi.entity.Orchard}.
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

  private List<ParentTreeGeneticInfoDto> parentTrees;

  public OrchardParentTreeDto() {
    this.parentTrees = new ArrayList<>();
  }
}
