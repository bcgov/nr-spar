package ca.bc.gov.oracleapi.entity.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "CNS17", schema = "CONSEP")
@Schema(description = "Represents the result for searching testing activities in the database CNS17 view")
public class ActivitySearchResultEntity {
  @Column(name = "SEEDLOT_DISPLAY", length = 13)
  private String seedlotDisplay;

  @Column(name = "REQUEST_ITEM", length = 22)
  private String requestItem;

  @Column(name = "VEGETATION_ST", length = 8)
  private String vegetationSt;

  @Column(name = "STNDRD_ACTIVITY_ID", length = 3)
  private String activityId;

  @Column(name = "TEST_RANK", length = 1)
  private String testRank;

  @Column(name = "CURRENT_TEST_IND")
  private Integer currentTestInd;

  @Column(name = "TEST_CATEGORY_CD", length = 3)
  private String testCategoryCd;

  @Column(name = "GERMINATION_PCT")
  private Integer germinationPct;

  @Column(name = "PV", length = 82)
  private String pv;

  @Column(name = "MOISTURE_PCT")
  private Integer moisturePct;

  @Column(name = "PURITY_PCT")
  private Integer purityPct;

  @Column(name = "SEEDS_PER_GRAM")
  private Integer seedsPerGram;

  @Column(name = "OTHER_TEST_RESULT")
  private Integer otherTestResult;

  @Column(name = "TEST_COMPLETE_IND")
  private Boolean testCompleteInd;

  @Column(name = "ACCEPT_RESULT_IND")
  private Integer acceptResultInd;

  @Column(name = "SIGNIFICNT_STS_IND", precision = 5, scale = 0)
  private Integer significntStsInd;

  @Column(name = "SEED_WITHDRAWAL_DATE")
  private LocalDate seedWithdrawalDate;

  @Column(name = "REVISED_END_DT")
  private LocalDate revisedEndDt;

  @Column(name = "ACTUAL_BEGIN_DT_TM")
  private LocalDateTime actualBeginDtTm;

  @Column(name = "ACTUAL_END_DT_TM")
  private LocalDateTime actualEndDtTm;

  @Column(name = "RIA_COMMENT", length = 2000)
  private String riaComment;

  @Column(name = "REQUEST_SKEY", precision = 10, scale = 0)
  private Integer requestSkey;

  @Column(name = "REQ_ID", length = 11)
  private String reqId;

  @Column(name = "ITEM_ID", length = 1)
  private String itemId;

  @Column(name = "SEEDLOT_SAMPLE", length = 13)
  private String seedlotSample;

  @Id
  @Column(name = "RIA_SKEY", precision = 10, scale = 0)
  private Integer riaSkey;
}
