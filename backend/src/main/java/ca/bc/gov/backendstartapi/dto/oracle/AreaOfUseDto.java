package ca.bc.gov.backendstartapi.dto.oracle;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

/** This class represents a JSON response when requesting SPZ + SPU information from a SPU id. */
@Getter
@Setter
@Schema(
    description = "Represents a JSON response when requesting SPZ + SPU information from a SPU id.")
public class AreaOfUseDto {
  @Schema(description = "A record of SPU.", example = "7")
  private AreaOfUseSpuGeoDto areaOfUseSpuGeoDto;

  @Schema(description = "A list of SPZ")
  private List<SpzDto> spzList;
}
