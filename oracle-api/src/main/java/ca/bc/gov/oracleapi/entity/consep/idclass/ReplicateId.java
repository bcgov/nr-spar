package ca.bc.gov.oracleapi.entity.consep.idclass;

import ca.bc.gov.oracleapi.entity.consep.ReplicateEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** This class holds the primary key columns of {@link ReplicateEntity}. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class ReplicateId {

  @Column(name = "RIA_SKEY")
  private BigDecimal riaKey;

  @Column(name = "TEST_REPLICATE_NO")
  private Integer replicateNumber;
}
