package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Collections;
import java.util.List;

/** This class holds the fields that will be returned from a ParentTree. */
@Schema(description = "A record that contains parent tree info and its genetic quality info")
public record SameSpeciesTreeDto(
    @Schema(description = "A unique identifier for each Parent Tree.", example = "4032")
        Long parentTreeId,
    @Schema(
            description =
                """
          The original registration number given to a Parent Tree in conjunction with a Species
          Code.
          """,
            example = "37")
        String parentTreeNumber,
    @Schema(description = "The id of an orchard this tree belongs to.", example = "405")
        String orchardId,
    @Schema(description = "The seed plan unit this tree belongs to.", example = "7") Long spu,
    List<ParentTreeGeneticQualityDto> parentTreeGeneticQualities) {

  /** Ensure immutability for the user's roles. */
  public SameSpeciesTreeDto {
    parentTreeGeneticQualities = Collections.unmodifiableList(parentTreeGeneticQualities);
  }
}
