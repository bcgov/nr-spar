package ca.bc.gov.oracleapi.dto;

import ca.bc.gov.oracleapi.entity.SeedPlanUnit;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** This class represents a JSON response when requesting SPU information with a SPU ID. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "A dto object that contains info of a seed plan unit and related data.")
public class SpuDto extends SeedPlanUnit {
  @Schema(description = "The Seed Plan Zone code", example = "M")
  private String seedPlanZoneCode;
}
