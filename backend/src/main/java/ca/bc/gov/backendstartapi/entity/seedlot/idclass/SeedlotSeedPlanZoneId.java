package ca.bc.gov.backendstartapi.entity.seedlot.idclass;

import ca.bc.gov.backendstartapi.entity.SeedlotSeedPlanZoneEntity;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

/** Composite key for {@link SeedlotSeedPlanZoneEntity}. */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
@RequiredArgsConstructor
@Getter
@Setter
@EqualsAndHashCode
public class SeedlotSeedPlanZoneId {

  @NonNull private String seedlot;

  @NonNull private String spzCode;
}
