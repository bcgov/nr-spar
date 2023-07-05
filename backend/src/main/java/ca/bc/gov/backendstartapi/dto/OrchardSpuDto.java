package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Collections;
import java.util.List;

/**
 * This class holds the fields that will be returned when requesting a ParentTree from an Orchard.
 */
public record OrchardSpuDto(
    @Schema(
            description =
                """
            A unique identifier which is assigned to a location where cuttings or A class seed is
            produced.
            """,
            example = "405")
        String orchardId,
    @Schema(description = "A code describing various Vegetation Species.", example = "ACT")
        String vegetationCode,
    @Schema(
            description = "A unique identifier which is assigned to a Seed Planning Unit.",
            example = "7")
        Long seedPlanningUnitId,
    List<ParentTreeDto> parentTrees) {

  /** Ensure immutability for the user's roles. */
  public OrchardSpuDto {
    parentTrees = Collections.unmodifiableList(parentTrees);
  }
}
