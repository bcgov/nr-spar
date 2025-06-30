package ca.bc.gov.oracleapi.entity.consep;

import ca.bc.gov.oracleapi.entity.consep.idclass.ReplicateId;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

/**
 * This class represents the debris data for purity
 * testing activities in CONSEP.
 */
@Getter
@Setter
@Entity
@Table(name = "CNS_T_DEBRIS_TEST")
@Schema(description = "Represents debris data for a purity test's replicate in the database")
public class PurityDebrisEntity {

  @EmbeddedId
  private ReplicateId id;

  @Column(name = "DEBRIS_SEQUENCE_NO")
  private BigDecimal debrisSeqNumber;

  @Column(name = "DEBRIS_RANK")
  private Integer debrisRank;

  @Column(name = "DEBRIS_TYPE_CD", length = 3)
  private String debrisTypeCode;
}
