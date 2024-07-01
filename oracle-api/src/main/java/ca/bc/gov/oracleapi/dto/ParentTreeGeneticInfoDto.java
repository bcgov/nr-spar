package ca.bc.gov.oracleapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * This class holds the fields that will be returned from a {@link
 * ca.bc.gov.oracleapi.entity.ParentTreeEntity}.
 */
@Getter
@Setter
@ToString
@Schema(description = "The geographic location of a each Parent Tree sourced from a natural stand.")
public class ParentTreeGeneticInfoDto extends ParentTreeDto {

  private List<ParentTreeGeneticQualityDto> parentTreeGeneticQualities;

  public ParentTreeGeneticInfoDto() {
    this.parentTreeGeneticQualities = List.of();
  }
}
