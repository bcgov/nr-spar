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
 * This class represents the replicates data for purity
 * testing activities in CONSEP.
 */
@Getter
@Setter
@Entity
@Table(name = "CNS_T_TEST_REP_PURITY")
@Schema(description = "Represents a single replicate data for purity tests in the database")
public class PurityReplicateEntity {

  @EmbeddedId
  private ReplicateId id;

  @Column(name = "PURE_SEED_WEIGHT", precision = 7, scale = 3)
  private BigDecimal pureSeedWeight;

  @Column(name = "OTHER_SEED_WEIGHT", precision = 7, scale = 3)
  private BigDecimal otherSeedWeight;

  @Column(name = "INERT_MATTR_WEIGHT", precision = 7, scale = 3)
  private BigDecimal inertMttrWeight;

  @Column(name = "REP_ACCEPTED_IND")
  private Integer replicateAccInd;

  @Column(name = "TOLRNC_OVRRDE_DESC", length = 2000)
  private String overrideReason;
}
