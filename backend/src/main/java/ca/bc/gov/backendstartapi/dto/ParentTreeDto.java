package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Collections;
import java.util.List;

/** This class holds the fields that will be returned from a ParentTree. */
@Schema(description = "The geographic location of a each Parent Tree sourced from a natural stand.")
public record ParentTreeDto(
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
    @Schema(
            description = "The code that indicates the status of the Parent Tree registration",
            example = "APP")
        String parentTreeRegStatusCode,
    @Schema(
            description = "A number that has historically been used to identify a Parent Tree.",
            example = "123456")
        String localNumber,
    @Schema(
            description = "Indicates whether the parent tree selection is active or inactive.",
            example = "Y")
        boolean active,
    @Schema(
            description = "Indicates whether the parent tree selection is tested or untested.",
            example = "Y")
        boolean tested,
    @Schema(
            description =
                "A code indicating if a parent tree is included in the forest genetics breeding"
                    + " program.",
            example = "Y")
        boolean breedingProgram,
    @Schema(description = "A unique identifier for each Parent Tree.", example = "123")
        Long femaleParentTreeId,
    @Schema(description = "A unique identifier for each Parent Tree.", example = "123")
        Long maleParentTreeId,
    List<ParentTreeGeneticQualityDto> parentTreeGeneticQualities) {

  /** Ensure immutability for the user's roles. */
  public ParentTreeDto {
    parentTreeGeneticQualities = Collections.unmodifiableList(parentTreeGeneticQualities);
  }
}
