package ca.bc.gov.backendstartapi.entity.idclass;

import ca.bc.gov.backendstartapi.entity.TestedPtAreaOfUseSpz;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

/** This class holds the primary key columns of {@link TestedPtAreaOfUseSpz}. */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Embeddable
public class TestedPtAreaOfUseSpzId {
  @NonNull Integer testedPtAreaOfUse;

  @NonNull private String seedPlanZoneCode;
}
