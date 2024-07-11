package ca.bc.gov.backendstartapi.dto;

import ca.bc.gov.backendstartapi.dto.oracle.SpuDto;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** The dto for a seedlot including its depencies values. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SeedlotDto {

  @Schema(description = "The seedlot entity in the seedlot table")
  private Seedlot seedlot;

  @Schema(description = "The primary seed plan unit")
  private SpuDto primarySpu;

  @Schema(description = "The primary seed plan zone")
  private SeedPlanZoneDto primarySpz;

  @Schema(description = "A list of additional seed plan zones")
  private List<SeedPlanZoneDto> additionalSpzList;

  @Schema(description = "Seedlot genetic worth stored values in the database")
  private List<GeneticWorthTraitsDto> calculatedValues;
}
