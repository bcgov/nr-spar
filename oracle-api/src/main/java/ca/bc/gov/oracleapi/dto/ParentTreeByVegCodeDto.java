package ca.bc.gov.oracleapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ParentTreeByVegCodeDto {
  @Schema(description = "A unique identifier for each Parent Tree.", example = "4032")
  private Long parentTreeId;

  @Schema(description = "Indicates whether the tree is tested.", example = "True")
  private Boolean testedInd;

  @Schema(description = "A list of orchard that this tree belongs to.", example = "[112, 222]")
  private List<String> orchardIds;

  @Schema(
      description =
          "A map with the Spu as the key and a list of ParentTreeGeneticQualityDto as value")
  private Map<Long, List<ParentTreeGeneticQualityDto>> geneticQualitiesBySpu;
}
