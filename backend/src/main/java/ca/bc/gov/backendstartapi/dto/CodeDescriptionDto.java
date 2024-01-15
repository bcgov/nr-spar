package ca.bc.gov.backendstartapi.dto;

import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * This general record is used for simple data object with only a code and description to be
 * consumed by endpoints.
 */
@Schema(
    description =
        """
        A DTO for common data record that consists of a code and a description.
        """)
public record CodeDescriptionDto(
    @Schema(description = "The Code that represent a data object", example = "1") String code,
    @Schema(description = "The description/value of the data object", example = "Squirrel cache")
        String description) {
  
  /**
   * Creates a {@link CodeDescriptionDto} from a {@link GeneticClassEntity} instance.
   *
   * @param entity The GeneticClassEntity instance
   * @return A CodeDescriptionDto
   */
  public static CodeDescriptionDto fromEntity(GeneticClassEntity entity) {
    return new CodeDescriptionDto(entity.getGeneticClassCode(), entity.getDescription());
  }
}
