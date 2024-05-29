package ca.bc.gov.backendstartapi.dto;

import ca.bc.gov.backendstartapi.entity.SeedlotSeedPlanZoneEntity;
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

  @Schema(description = "The pirmary seed plan zone")
  private SeedPlanZoneDto priamrySpz;

  @Schema(description = "A list of additional seed plan zones")
  private List<SeedPlanZoneDto> additionalSpzList;
}
