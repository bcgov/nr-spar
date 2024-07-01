package ca.bc.gov.oracleapi.entity.idclass;

import ca.bc.gov.oracleapi.entity.TestedPtAreaOfUseSpu;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

/** This class holds the primary key columns of {@link TestedPtAreaOfUseSpu}. */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Embeddable
public class TestedPtAreaOfUseSpuId {
  @NonNull private Integer testedPtAreaOfUseId;

  @NonNull private Integer seedPlanUnitId;
}
