package ca.bc.gov.oracleapi.entity.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
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
@Table(name = "CNS_T_TSC_TEST_RESULT", schema = "CONSEP")
@Schema(description = "Represents the result of a testing activity for a seedlot in the database")
public class TestResultEntity {

  @Id
  @Column(name = "RIA_SKEY", precision = 10, scale = 0)
  private BigDecimal riaKey;

  @Column(name = "ACTIVITY_TYPE_CD", length = 3)
  private String activityType;

  @Column(name = "STANDARD_TEST_IND")
  private Integer standardTest;

  @Column(name = "TEST_CATEGORY_CD", length = 3)
  private String testCategory;

  @Column(name = "ACCEPT_RESULT_IND")
  private Integer acceptResult;

  @Column(name = "TEST_COMPLETE_IND")
  private Integer testCompleteInd;

  @Column(name = "ORIGINAL_TEST_IND")
  private Integer originalTest;

  @Column(name = "CURRENT_TEST_IND")
  private Integer currentTest;

  @Column(name = "TEST_RANK", length = 1)
  private String testRank;

  @Column(name = "SAMPLE_DESC", length = 30)
  private String sampleDesc;

  @Column(name = "MOISTURE_STATUS_CD", length = 3)
  private String moistureStatus;

  @Column(name = "GERMINATION_PCT")
  private Integer germinationPct;

  @Column(name = "MOISTURE_PCT", precision = 4, scale = 1)
  private BigDecimal moisturePct;

  @Column(name = "GERMINATION_VALUE")
  private Integer germinationValue;

  @Column(name = "PEAK_VALUE_GRM_PCT")
  private Integer peakValueGrmPct;

  @Column(name = "PEAK_VALUE_NO_DAYS")
  private Integer peakValueNoDays;

  @Column(name = "WEIGHT_PER_100", precision = 7, scale = 3)
  private BigDecimal weightPer100;

  @Column(name = "SEEDS_PER_GRAM")
  private Integer seedsPerGram;

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

  @Column(name = "GERMINATOR_TRAY_ID")
  private Integer germinatorTrayId;

  @Column(name = "LABEL_IND")
  private Integer labelInd;

  @Column(name = "RE_SAMPLE_IND")
  private Integer reSampleInd;
}
