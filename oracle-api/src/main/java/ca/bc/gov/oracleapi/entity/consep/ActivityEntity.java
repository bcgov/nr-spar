package ca.bc.gov.oracleapi.entity.consep;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/**
 * This class represents the data of activities related to requests in CONSEP.
 */
@Getter
@Setter
@Entity
@Table(name = "CNS_T_RQST_ITM_ACTVTY", schema = "CONSEP")
@Schema(description = "Represents the data of activities related to requests in CONSEP")
public class ActivityEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ria_seq")
  @SequenceGenerator(
      name = "ria_seq",
      sequenceName = "CNS_RIA_COUNTER",
      allocationSize = 1
  )
  @Column(name = "RIA_SKEY", precision = 10, scale = 0)
  private BigDecimal riaKey;

  @Column(name = "REQUEST_ID", length = 11)
  private String requestId;

  @Column(name = "REQUEST_SKEY", precision = 10, scale = 0)
  private BigDecimal requestSkey;

  @Column(name = "ITEM_ID", length = 1)
  private String itemId;

  @Column(name = "SEEDLOT_NUMBER", length = 5)
  private String seedlotNumber;

  @Column(name = "FAMILY_LOT_NUMBER", length = 13)
  private String familyLotNumber;

  @Column(name = "VEGETATION_ST", length = 8)
  private String vegetationState;

  @Column(name = "STNDRD_ACTIVITY_ID", length = 3)
  private String standardActivityId;

  @Column(name = "ACTIVITY_TYPE_CD", length = 3)
  private String activityTypeCode;

  @Column(name = "TEST_CATEGORY_CD", length = 3)
  private String testCategoryCode;

  @Column(name = "EARLIEST_START_DT")
  private LocalDate earliestStartDate;

  @Column(name = "LATEST_START_DT")
  private LocalDate latestStartDate;

  @Column(name = "PLANNED_START_DT")
  private LocalDate plannedStartDate;

  @Column(name = "REVISED_START_DT")
  private LocalDate revisedStartDate;

  @Column(name = "EARLIEST_END_DT")
  private LocalDate earliestEndDate;

  @Column(name = "LATEST_END_DT")
  private LocalDate latestEndDate;

  @Column(name = "PLANNED_END_DT")
  private LocalDate plannedEndDate;

  @Column(name = "REVISED_END_DT")
  private LocalDate revisedEndDate;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
  @Column(name = "ACTUAL_BEGIN_DT_TM")
  private LocalDateTime actualBeginDateTime;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
  @Column(name = "ACTUAL_END_DT_TM")
  private LocalDateTime actualEndDateTime;

  @Column(name = "ACTIVITY_DURATION")
  private Integer activityDuration;

  @Column(name = "ACTVTY_TM_UNIT_ST", length = 3)
  private String activityTimeUnit;

  @Column(name = "SIGNIFICNT_STS_IND")
  private Integer significantStatusIndicator;

  @Column(name = "PROCESS_COMMIT_IND")
  private Integer processCommitIndicator;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
  @Column(name = "UPDATE_TIMESTAMP")
  private LocalDateTime updateTimestamp;

  @Column(name = "PROCESS_RESULT_IND")
  private Integer processResultIndicator;

  @Column(name = "TEST_RESULT_IND")
  private Integer testResultIndicator;

  @Column(name = "ASSOCIATD_RIA_SKEY", precision = 10, scale = 0)
  private BigDecimal associatedRiaKey;

  @Column(name = "WORK_CENTRE_ID", length = 3)
  private String workCentreId;

  @Column(name = "BLENDING_METHOD_CD", length = 3)
  private String blendingMethod;

  @Column(name = "DRYER_USED_CD", length = 3)
  private String dryerUsed;

  @Column(name = "DECK_TYPE_CD", length = 3)
  private String deckType;

  @Column(name = "DSP_METHOD_CD", length = 3)
  private String dspMethod;

  @Column(name = "TOTAL_SOAK_HOURS")
  private Integer totalSoakHours;

  @Column(name = "TOTAL_SOAK_MINUTES")
  private Integer totalSoakMinutes;

  @Column(name = "TARGET_FLOATRS_PCT")
  private Integer targetFloaters;

  @Column(name = "TARGET_SINKERS_PCT")
  private Integer targetSinkers;

  @Column(name = "WATER_TEMP_MIN")
  private Integer waterTempMin;

  @Column(name = "WATER_TEMP_MAX")
  private Integer waterTempMax;

  @Column(name = "DEWING_METHOD_CD", length = 3)
  private String dewingMethod;

  @Column(name = "AVG_DRUM_SPEED", length = 3)
  private String averageDrumSpeed;

  @Column(name = "WATER_TEMP_CD", length = 3)
  private String waterTemp;

  @Column(name = "TOT_HOURS_BATCH")
  private Integer totalHoursBatch;

  @Column(name = "TOT_MINUTES_BATCH")
  private Integer totalMinutesBatch;

  @Column(name = "TOT_MISTNG_MINUTES")
  private Integer totalMistingMinutes;

  @Column(name = "TOT_MISTNG_SECONDS")
  private Integer totalMistingSeconds;

  @Column(name = "DEWING_SEP_EASE_CD", length = 3)
  private String dewingSeparation;

  @Column(name = "HAND_DWNG_RQRD_IND")
  private Integer handDewing;

  @Column(name = "PROCESS_MACHINE_CD", length = 3)
  private String processMachine;

  @Column(name = "SEP_MACHINE_CD", length = 3)
  private String sepMachine;

  @Column(name = "NO_PNEUMATC_SPRTRS")
  private Integer noPneumatic;

  @Column(name = "DRY_WEIGHT", precision = 9, scale = 3)
  private BigDecimal dryWeight;

  @Column(name = "PRIOR_MOIST_CONT", precision = 3, scale = 1)
  private BigDecimal priorMoist;

  @Column(name = "TARGET_FRSH_WEIGHT", precision = 7, scale = 1)
  private BigDecimal targetFreshWeight;

  @Column(name = "TARGET_MOIST_CONT", precision = 3, scale = 1)
  private BigDecimal targetMoistureContent;

  @Column(name = "DRYBACK_WEIGHT", precision = 9, scale = 3)
  private BigDecimal drybackWeight;

  @Column(name = "DRYBACK_MOIST_CONT", precision = 3, scale = 1)
  private BigDecimal drybackMoist;

  @Column(name = "DRYING_METHOD_CD", length = 3)
  private String dryingMethod;

  @Column(name = "TEMPERATURE")
  private Integer temperature;

  @Column(name = "DEPTH_PER_TRAY")
  private Integer depthPerTray;

  @Column(name = "SCREEN_MACHINE_1_CD", length = 3)
  private String screenMachineOne;

  @Column(name = "SCREEN_MACHINE_2_CD", length = 3)
  private String screenMachineTwo;

  @Column(name = "SCREEN_MACHINE_3_CD", length = 3)
  private String screenMachineThree;

  @Column(name = "NO_TIMES_REPEATED")
  private Integer noTimesRepeated;

  @Column(name = "WATER_TYPE_CD", length = 3)
  private String waterType;

  @Column(name = "TUMBLER_TYPE_CD", length = 3)
  private String tumblerType;

  @Column(name = "TUMBLER_SLOPE")
  private Integer tumblerSlope;

  @Column(name = "TUMBLER_RPM", precision = 5, scale = 2)
  private BigDecimal tumblerRpm;

  @Column(name = "INTRMDT_CLEANR_IND")
  private Integer intermediateCleaner;

  @Column(name = "CLOSED_PCT")
  private Integer closedPercentage;

  @Column(name = "SLIGHT_FLEX_PCT")
  private Integer slightFlex;

  @Column(name = "MODERATE_FLEX_PCT")
  private Integer moderateFlex;

  @Column(name = "FULL_FLEX_PCT")
  private Integer fullFlex;

  @Column(name = "KILN_PROGRAM_ID", length = 5)
  private String kilnProgram;

  @Column(name = "TURNING_PRFRMD_IND")
  private Integer turningPrfmd;

  @Column(name = "HOURS_REQUIRED", precision = 4, scale = 1)
  private BigDecimal hoursRequired;

  @Column(name = "FILLED_SEED_AVG", precision = 5, scale = 2)
  private BigDecimal filledSeedAverage;

  @Column(name = "RIA_COMMENT", length = 2000)
  private String riaComment;

  @Column(name = "IMBIBED_WT", precision = 9, scale = 3)
  private BigDecimal imbibedWeight;

  @Column(name = "DRYBACK_TIME")
  private Integer drybackTime;

  @Column(name = "TARG_30_MOIST_CONT", precision = 5, scale = 3)
  private BigDecimal targetThirtyMoist;

  @Column(name = "TARG_35_MOIST_CONT", precision = 5, scale = 3)
  private BigDecimal targetThirtyFiveMoist;

  @Column(name = "STRAT_END_WEIGHT", precision = 9, scale = 3)
  private BigDecimal stratEndWeight;
}
