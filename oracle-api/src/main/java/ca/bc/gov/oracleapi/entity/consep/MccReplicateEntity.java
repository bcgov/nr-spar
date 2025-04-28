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
 * This class represents the replicates data for moisture content
 * testing activities in CONSEP.
 */
@Getter
@Setter
@Entity
@Table(name = "CNS_T_TEST_REP_MC")
@Schema(description = "Represents a single replicate data for moisture content in the database")
public class MccReplicateEntity {

  @EmbeddedId
  private ReplicateId id;

  @Column(name = "CONTAINER_ID", length = 4)
  private String containerId;

  @Column(name = "FRESH_WEIGHT", precision = 7, scale = 3)
  private BigDecimal freshSeed;

  @Column(name = "CNTNR_AND_DRY_WGHT", precision = 7, scale = 3)
  private BigDecimal containerAndDryWeight;

  @Column(name = "CONTAINER_WEIGHT", precision = 7, scale = 3)
  private BigDecimal containerWeight;

  @Column(name = "DRY_WEIGHT", precision = 7, scale = 3)
  private BigDecimal dryWeight;

  @Column(name = "REP_ACCEPTED_IND")
  private Integer replicateAccInd;

  @Column(name = "TOLRNC_OVRRDE_DESC", length = 2000)
  private String overrideReason;

  @Column(name = "REPLICATE_COMMENT", length = 255)
  private String replicateComment;
}
