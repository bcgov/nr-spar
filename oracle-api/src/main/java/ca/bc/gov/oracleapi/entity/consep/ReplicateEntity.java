package ca.bc.gov.oracleapi.entity.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
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
@Schema(description = "Represents a single replicate information of a testing activity for a seedlot in the database")
public class ReplicateEntity {

  @Id
  @Column(name = "RIA_SKEY", precision = 10, scale = 10)
  private BigDecimal riaKey;

  @Id
  @Column(name = "TEST_REPLICATE_NO", precision = 5, scale = 5)
  private BigDecimal replicateNumber;

  @Column(name = "CONTAINER_ID", length = 4)
  private String containerId;

  @Column(name = "CONTAINER_WEIGHT", precision = 7, scale = 3, nullable = false)
  private BigDecimal containerWeight;

  @Column(name = "FRESH_WEIGHT", precision = 7, scale = 3, nullable = false)
  private BigDecimal freshSeed;

  @Column(name = "CNTNR_AND_DRY_WGHT", precision = 7, scale = 3, nullable = false)
  private BigDecimal containerAndDryWeight;

  @Column(name = "DRY_WEIGHT", precision = 7, scale = 3, nullable = false)
  private BigDecimal dryWeight;

  @Column(name = "REP_ACCEPTED_IND", precision = 5, scale = 5)
  private BigDecimal replicateAccInd;

  @Column(name = "REPLICATE_COMMENT", length = 255)
  private String replicateComment;

  @Column(name = "TOLRNC_OVRRDE_DESC", length = 2000)
  private String overrideReason;
}
