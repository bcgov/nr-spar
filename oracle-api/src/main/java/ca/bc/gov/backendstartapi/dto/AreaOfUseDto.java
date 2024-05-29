package ca.bc.gov.backendstartapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** This class represents a JSON response when requesting SPZ + SPU information from a SPU id. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(
    description = "Represents a JSON response when requesting SPZ + SPU information from a SPU id.")
public class AreaOfUseDto {
  @Schema(description = "Geographical data wrangled from a list of spu data.")
  private AreaOfUseSpuGeoDto areaOfUseSpuGeoDto;

  @Schema(description = "A list of SPZ")
  private List<SpzDto> spzList;
}
