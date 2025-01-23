package ca.bc.gov.oracleapi.entity.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

/**
 * This class represents the results of testing activities in CONSEP.
 */
@Getter
@Setter
@Entity
@Table(name = "CNS_T_TSC_TEST_RESULT")
@Schema(description = "Represents the result of a testing activity for a seedlot in the database")
public class TestResultEntity {

  @Id
  @Column(name = "RIA_SKEY", precision = 10, scale = 10)
  private BigDecimal riaKey;

  @Column(name = "ACTIVITY_TYPE_CD", length = 3)
  private String activityType;

  @Column(name = "STANDARD_TEST_CD", precision = 5, scale = 5)
  private BigDecimal standardTest;

  @Column(name = "TEST_CATEGORY_CD", length = 3)
  private String testCategory;

  @Column(name = "ACCEPT_RESULT_IND", precision = 5, scale = 5)
  private BigDecimal acceptResult;

  @Column(name = "TEST_COMPLETE_IND", precision = 5, scale = 5)
  private BigDecimal testCompleteInd;

  @Column(name = "ORIGINAL_TEST_IND", precision = 5, scale = 5)
  private BigDecimal originalTest;

  @Column(name = "CURRENT_TEST_IND", precision = 5, scale = 5)
  private BigDecimal currentTest;

  @Column(name = "TEST_RANK", length = 1)
  private String testRank;

  @Column(name = "SAMPLE_DESC", length = 30)
  private String sampleDesc;

  @Column(name = "MOISTURE_STATUS_CD", length = 3)
  private String moistureStatus;

  @Column(name = "GERMINATION_PCT", precision = 5, scale = 5)
  private BigDecimal germinationPct;

  @Column(name = "MOISTURE_PCT", precision = 4, scale = 1)
  private BigDecimal moisturePct;

  @Column(name = "GERMINATION_VALUE", precision = 5, scale = 5)
  private BigDecimal germinationValue;

  @Column(name = "PEAK_VALUE_GRM_PCT", precision = 5, scale = 5)
  private BigDecimal peakValueGrmPct;

  @Column(name = "PEAK_VALUE_NO_DAYS", precision = 5, scale = 5)
  private BigDecimal peakValueNoDays;

  @Column(name = "WEIGHT_PER_100", precision = 7, scale = 3)
  private BigDecimal weightPer100;

  @Column(name = "SEEDS_PER_GRAM", precision = 5, scale = 5)
  private BigDecimal seedsPerGram;

  @Column(name = "PURITY_PCT", precision = 4, scale = 1)
  private BigDecimal purityPct;

  @Column(name = "OTHER_TEST_RESULT", precision = 8, scale = 3)
  private BigDecimal otherTestResult;

  @Column(name = "UPDATE_TIMESTAMP")
  private LocalDate updateTimestamp;

  @Column(name = "STRAT_START_DT")
  private LocalDate stratStartDate;

  @Column(name = "GERM_CNT_START_DT")
  private LocalDate germStartDate;

  @Column(name = "GERM_NEXT_STAGE_DT")
  private LocalDate germNextStageDate;

  @Column(name = "SEED_WITHDRAWAL_DATE")
  private LocalDate seedWithdrawDate;

  @Column(name = "WARM_STRAT_START_DATE")
  private LocalDate warmStratStartDate;

  @Column(name = "DRYBACK_START_DATE")
  private LocalDate drybackStartDate;

  @Column(name = "GERMINATOR_ENTRY")
  private LocalDate germinatorEntry;

  @Column(name = "GERMINATOR_ID", length = 1)
  private String germinatorId;

  @Column(name = "GERMINATOR_TRAY_ID", precision = 5, scale = 5)
  private BigDecimal germinatorTrayId;

  @Column(name = "LABEL_IND", precision = 5, scale = 5)
  private BigDecimal labelInd;

  @Column(name = "RE_SAMPLE_IND", precision = 5, scale = 5)
  private BigDecimal reSampleInd;
}
