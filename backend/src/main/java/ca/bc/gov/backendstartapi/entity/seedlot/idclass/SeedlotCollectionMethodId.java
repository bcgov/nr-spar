package ca.bc.gov.backendstartapi.entity.seedlot.idclass;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

/** Composite key for {@link ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionMethod}. */
@Getter
@Setter
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
public class SeedlotCollectionMethodId implements Serializable {

  @NonNull private String seedlot;

  private int coneCollectionMethod;
}
