package ca.bc.gov.backendstartapi.entity.seedlot.idclass;

import java.io.Serializable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

/** Composite key for {@link ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionMethod}. */
@Getter
@Setter
@EqualsAndHashCode
public class SeedlotCollectionMethodId implements Serializable {

  @NonNull private String seedlot;

  private int coneCollectionMethod;

  public SeedlotCollectionMethodId(String seedlot, int coneCollectionMethod) {
    this.seedlot = seedlot;
    this.coneCollectionMethod = coneCollectionMethod;
  }
}
