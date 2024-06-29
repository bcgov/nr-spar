package ca.bc.gov.oracleapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/** This class holds the fields that will be returned from a ParentTree and other tables. */
@Getter
@Setter
@ToString
@AllArgsConstructor
@Schema(
    description =
        """
        This general record is used for an object of a list that consists of an id and value.
        """)
public class SameSpeciesTreeDto {
  @Schema(description = "A unique identifier for each Parent Tree.", example = "4032")
  private Long parentTreeId;

  @Schema(
      description =
          """
                  The original registration number given to a Parent Tree in conjunction with
                  a species code.
                """,
      example = "37")
  private String parentTreeNumber;

  @Schema(description = "The id of an orchard this tree belongs to.", example = "405")
  private String orchardId;

  @Schema(description = "The seed plan unit this tree belongs to.", example = "7")
  private Long spu;

  private List<ParentTreeGeneticQualityDto> parentTreeGeneticQualities;

  public SameSpeciesTreeDto() {
    this.parentTreeGeneticQualities = List.of();
  }
}
