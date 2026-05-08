package ca.bc.gov.oracleapi.entity.consep;

import ca.bc.gov.oracleapi.entity.consep.idclass.ReplicateId;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Represents one row in consep.cns_t_test_rep_germ — one row per replicate
 * for a germination test.
 */
@Getter
@Setter
@Entity
@Table(name = "CNS_T_TEST_REP_GERM", schema = "CONSEP")
@Schema(description = "Represents a single replicate of a germination test in CONSEP")
public class TestRepGermEntity {

  @EmbeddedId
  private ReplicateId id;

  @Column(name = "TOTAL_NO_SEEDS", precision = 5, scale = 0)
  private Integer totalNoSeeds;

  @Column(name = "FINAL_UNGRM_NORMAL", precision = 5, scale = 0)
  private Integer finalUngrmNormal;

  @Column(name = "FINAL_UNGRM_SHRVL", precision = 5, scale = 0)
  private Integer finalUngrmShrvl;

  @Column(name = "FINAL_UNGRM_EMPTY", precision = 5, scale = 0)
  private Integer finalUngrmEmpty;

  @Column(name = "FINAL_UNGRM_INSCT", precision = 5, scale = 0)
  private Integer finalUngrmInsct;

  @Column(name = "FINAL_UNGRM_DAMAGD", precision = 5, scale = 0)
  private Integer finalUngrmDamagd;

  @Column(name = "FINAL_UNGRM_ROTTEN", precision = 5, scale = 0)
  private Integer finalUngrmRotten;

  @Column(name = "FINAL_PREGERM", precision = 5, scale = 0)
  private Integer finalPregerm;

  @Column(name = "REP_ACCEPTED_IND", precision = 5, scale = 0)
  private Integer repAcceptedInd;

  @Column(name = "TOLRNC_OVRRDE_DESC", length = 2000)
  private String tolrncOvrrdeDesc;
}
