package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/** This general record is used for an object of a list that consists of an id and value. */
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
  private Long parentTreeId;
  private String parentTreeNumber;
  private String orchardId;
  private Long spu;
  private List<ParentTreeGeneticQualityDto> parentTreeGeneticQualities;

  public SameSpeciesTreeDto() {
    this.parentTreeGeneticQualities = List.of();
  }
}
