package ca.bc.gov.backendstartapi.entity.idclass;

import ca.bc.gov.backendstartapi.entity.TestedPtAreaOfUseSpu;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

/** This class holds the primary key columns of {@link TestedPtAreaOfUseSpu}. */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Embeddable
public class TestedPtAreaOfUseSpuId {
  @NonNull private Integer testedPtAreaOfUseId;

  @NonNull private Integer seedPlanUnitId;
}
