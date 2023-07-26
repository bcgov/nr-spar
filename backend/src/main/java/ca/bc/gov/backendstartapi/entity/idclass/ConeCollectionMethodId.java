package ca.bc.gov.backendstartapi.entity.idclass;

import ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

/** Composite key for {@link ConeCollectionMethodEntity}. */
@Data
@NoArgsConstructor(access = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class ConeCollectionMethodId {

  @NonNull private String orchardId;

  private int seedPlanningUnitId;
}
