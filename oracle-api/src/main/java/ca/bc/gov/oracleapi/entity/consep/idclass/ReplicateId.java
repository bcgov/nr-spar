package ca.bc.gov.oracleapi.entity.consep.idclass;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** This class holds the primary key columns for replicate related entities. */
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
