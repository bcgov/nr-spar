package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.DailyAbnormalResponseDto;
import ca.bc.gov.oracleapi.dto.consep.GermTestResultDto;
import ca.bc.gov.oracleapi.dto.consep.GerminationTestHeaderDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayCreateDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayCreateResponseDto;
import ca.bc.gov.oracleapi.dto.consep.ReplicateAbnormalDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.entity.consep.DailyAbnormalEntity;
import ca.bc.gov.oracleapi.entity.consep.GermCountEntity;
import ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity;
import ca.bc.gov.oracleapi.entity.consep.TestRegimeEntity;
import ca.bc.gov.oracleapi.entity.consep.TestRepGermEntity;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.repository.consep.ActivityRepository;
import ca.bc.gov.oracleapi.repository.consep.DailyAbnormalRepository;
import ca.bc.gov.oracleapi.repository.consep.GermCountRepository;
import ca.bc.gov.oracleapi.repository.consep.GerminatorTrayRepository;
import ca.bc.gov.oracleapi.repository.consep.TestRegimeRepository;
import ca.bc.gov.oracleapi.repository.consep.TestRepGermRepository;
import ca.bc.gov.oracleapi.repository.consep.TestResultRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.IncorrectResultSizeDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** The class for Moisture Content Cones Service and test result service. */
@Service
@RequiredArgsConstructor
public class TestResultService {

  private final TestResultRepository testResultRepository;
  private final GerminatorTrayRepository germinatorTrayRepository;
  private final ActivityRepository activityRepository;
  private final TestRegimeRepository testRegimeRepository;
  private final DailyAbnormalRepository dailyAbnormalRepository;
  private final GermCountRepository germCountRepository;
  private final TestRepGermRepository testRepGermRepository;

  /**
   * Update the test status to "completed".
   *
   * @param riaKey the identifier key for all table related to MCC
   */
  public void updateTestResultStatusToCompleted(BigDecimal riaKey) {
    SparLog.info("Updating test result status to completed for RIA_SKEY: {}", riaKey);

    testResultRepository.updateTestResultStatusToCompleted(riaKey);

    SparLog.info("Test result status updated to completed for RIA_SKEY: {}", riaKey);
  }

  /**
   * Accept the test results for the given riaKey.
   *
   * @param riaKey the identifier key for the test result table
   */
  public void acceptTestResult(BigDecimal riaKey) {
    SparLog.info("Accepting moisture content data for RIA_SKEY: {}", riaKey);

    Optional<TestResultEntity> testResultData = testResultRepository.findById(riaKey);

    if (testResultData.isEmpty()) {
      SparLog.warn("No data found for RIA_SKEY: {}", riaKey);
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No data found for given RIA_KEY");
    }

    if (testResultData.get().getTestCompleteInd() == 0) {
      SparLog.error("Test is not completed for RIA_SKEY: {}", riaKey);
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Test is not completed");
    }

    testResultRepository.updateTestResultStatusToAccepted(riaKey);
    SparLog.info("Test result accepted for RIA_SKEY: {}", riaKey);
  }

  /**
   * Get the germination test header for the given riaKey.
   *
   * @param riaKey the identifier key for the test result table
   * @return the germination test header
   */
  public GerminationTestHeaderDto getGerminationTestHeader(BigDecimal riaKey) {
    SparLog.info("Fetching germination test header for RIA_SKEY: {}", riaKey);

    try {
      GerminationTestHeaderDto dto =
          testResultRepository
              .findGerminationTestHeaderByRiaKey(riaKey)
              .orElseThrow(
                  () -> {
                    SparLog.warn("No germination test header found for RIA_SKEY: {}", riaKey);
                    return new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No germination test data found for given RIA_SKEY");
                  });

      // Compute soakEndDate in service layer
      LocalDateTime soakEndDate = null;
      if (dto.actualBeginDtTm() != null) {
        // Get soak hours from test result
        TestRegimeEntity regime = testRegimeRepository.findById(dto.activityTypeCd()).orElse(null);
        int soakHours =
            (regime != null && regime.getSoakHours() != null) ? regime.getSoakHours() : 0;
        soakEndDate = dto.actualBeginDtTm().plusHours(soakHours);
      }

      // Create new DTO with computed soakEndDate
      return new GerminationTestHeaderDto(
          dto.riaSkey(),
          dto.activityTypeCd(),
          dto.actualBeginDtTm(),
          dto.actualEndDtTm(),
          dto.testCategoryCd(),
          dto.moistureStatusCd(),
          dto.sampleDesc(),
          dto.acceptResultInd(),
          dto.testCompleteInd(),
          dto.riaComment(),
          dto.standardTestInd(),
          dto.testRank(),
          dto.germinationPct(),
          dto.germinationValue(),
          dto.peakValueGrmPct(),
          dto.peakValueNoDays(),
          dto.seedWithdrawalDate(),
          dto.revisedStartDt(),
          dto.revisedEndDt(),
          dto.activityDuration(),
          dto.actvtyTmUnitSt(),
          dto.stratStartDt(),
          dto.drybackStartDate(),
          dto.warmStratStartDate(),
          dto.germinatorEntry(),
          dto.germinatorTrayId(),
          dto.germinatorId(),
          soakEndDate,
          dto.imbibedWt(),
          dto.dryWeight(),
          dto.drybackWeight(),
          dto.intrmdtCleanrInd(),
          dto.requestTypeSt());

    } catch (IncorrectResultSizeDataAccessException ex) {
      SparLog.error("Data integrity issue: multiple rows found for RIA_SKEY {}", riaKey, ex);
      throw new DataIntegrityViolationException(
          "Expected exactly one germination test row for RIA_SKEY " + riaKey, ex);
    }
  }

  /**
   * Assign germinator trays for the given activities.
   * Activities are first grouped by activity type (as indicated by
   * {@link GerminatorTrayCreateDto#activityTypeCd()}). Within each activity type group,
   * a sequence of trays is created, with each tray holding up to 5 activities/tests.
   * When a group contains more than 5 activities, additional trays are created so that
   * no tray exceeds this limit.
   *
   * @param requests the list of germinator tray creation requests to be assigned to trays
   * @return a list of responses describing the trays that were created and their assignments
   */
  public List<GerminatorTrayCreateResponseDto> assignGerminatorTrays(
      List<GerminatorTrayCreateDto> requests
  ) {
    if (requests == null || requests.isEmpty()) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Create germinator tray request list cannot be null or empty"
      );
    }

    // Validate selected seed tests and collect their GermTestResultDto values in one pass.
    Map<BigDecimal, GermTestResultDto> germTestCache = collectAndValidateGermTestResults(requests);

    LocalDate today = LocalDate.now();
    LocalDateTime now = LocalDateTime.now();
    List<GerminatorTrayCreateResponseDto> trayResponses = new ArrayList<>();

    // Group by activityTypeCd (G10, G20, G44, G64...)
    Map<String, List<GerminatorTrayCreateDto>> groupedByActivityType =
        requests.stream()
            .collect(Collectors.groupingBy(GerminatorTrayCreateDto::activityTypeCd));

    // Loop per activity type code
    for (Map.Entry<String, List<GerminatorTrayCreateDto>> entry : groupedByActivityType.entrySet()) {

      String activityTypeCd = entry.getKey();
      List<GerminatorTrayCreateDto> activities = entry.getValue();

      SparLog.info(
          "Creating germinator trays for activity type code {} with {} activities",
          activityTypeCd,
          activities.size()
      );

      int trayNumber = 0;
      GerminatorTrayEntity currentTray = null;
      Integer trayId = null;

      // Loop through activities
      for (int i = 0; i < activities.size(); i++) {
        GerminatorTrayCreateDto activity = activities.get(i);
        BigDecimal activityRiaSkey = activity.riaSkey();
        LocalDateTime actualBeginDtTm = activity.actualBeginDtTm();

        // Every 5 items → new tray (0, 5, 10, 15...)
        if (i % 5 == 0) {
          trayNumber++;

          GerminatorTrayEntity tray = new GerminatorTrayEntity();
          tray.setActivityTypeCd(activityTypeCd);
          tray.setSystemTrayNo(trayNumber);
          tray.setActualStartDate(today.atStartOfDay());
          tray.setDateCreated(now);
          tray.setRevisionCount(0L);

          currentTray = germinatorTrayRepository.save(tray);
          trayId = currentTray.getGerminatorTrayId();

          SparLog.info(
              "Created germinator tray {} for activity type {} (tray no {})",
              trayId,
              activityTypeCd,
              trayNumber
          );

          // Add newly created tray to response
          trayResponses.add(new GerminatorTrayCreateResponseDto(
              activityTypeCd,
              trayId,
              currentTray.getActualStartDate()
          ));
        }

        SparLog.debug("Processing activity {} (activity type: {}), actualBeginDtTm: {}, trayId: {}",
            activityRiaSkey, activityTypeCd, actualBeginDtTm, trayId);

        ActivityEntity activityEntity = activityRepository.findById(activityRiaSkey)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Activity not found in CNS_T_RQST_ITM_ACTVTY table"
                )
            );

        if (actualBeginDtTm != null && !actualBeginDtTm.toLocalDate().equals(today)) {
          // Assign test to tray
          GermTestResultDto germTestResult = germTestCache.get(activityRiaSkey);

          Integer warmStratHours = germTestResult.warmStratHours();
          Integer soakHours = germTestResult.soakHours();
          Integer stratHours = germTestResult.stratHours();

          // Defensive: Default short-circuit for nulls
          int soak = (soakHours != null) ? soakHours : 0;
          int warm = (warmStratHours != null) ? warmStratHours : 0;
          int strat = (stratHours != null) ? stratHours : 0;

          LocalDate trayWarmStratDate = today.plusDays(soak / 24);
          LocalDate trayColdStratDate = today.plusDays((soak + warm) / 24);
          LocalDate trayGerminatorEntryDate = today.plusDays((soak + warm + strat) / 24);
          LocalDate trayDrybackDate = today.plusDays((soak / 24) + 28);

          testResultRepository.saveGerminatorTray(
              activityRiaSkey,
              trayId,
              warmStratHours,
              trayWarmStratDate,
              trayColdStratDate,
              trayDrybackDate,
              trayGerminatorEntryDate
          );

          SparLog.info("Assign activity {} to tray {}", activityRiaSkey, trayId);

          // Update test activity dates
          Integer activityDuration = activityEntity.getActivityDuration();
          LocalDate revisedEndDate = (activityDuration != null)
              ? today.plusDays(activityDuration) : null;
          activityRepository.updateActualBeginAndRevisedDates(
              activityRiaSkey,
              today.atStartOfDay(),
              today,
              revisedEndDate
          );
          SparLog.info("Updated dates for activity {}: "
                  + "actual_begin_dt_tm={}, revised_start_dt={}, revised_end_dt={}",
              activityRiaSkey, today.atStartOfDay(), today, revisedEndDate
          );
        } else {
          testResultRepository.updateGerminatorTray(
              activityRiaSkey,
              trayId
          );
          SparLog.info("Set tray {} for already started activity {}", trayId, activityRiaSkey);
        }

        // Ensure RTS or TST commitment processed - may update 0 rows
        // Find activities with same request_skey and item_id but different ria_skey
        if ("RTS".equals(activityTypeCd) || "TST".equals(activityTypeCd)) {
          if (activityEntity.getRequestSkey() != null && activityEntity.getItemId() != null) {
            List<ActivityEntity> conflictActivities = activityRepository.findConflictingActivities(
                activityRiaSkey,
                activityEntity.getRequestSkey(),
                activityEntity.getItemId()
            );

            if (conflictActivities.isEmpty()) {
              // Perform update
              activityRepository.markSignificantAndCommit(activityRiaSkey);
              SparLog.info("Commit processed for activity {}", activityRiaSkey);
            }
          } else {
            SparLog.warn(
                "Skipping commitment processing for activity {} because requestSkey or itemId is"
                    + " null",
                activityRiaSkey);
          }
        }
      }
    }
    return trayResponses;
  }

  /**
   * Validate each GerminatorTrayCreateDto in the incoming request list and collect
   * GermTestResultDto objects for reuse.
   *
   * Checks performed for each request:
   *  - seedWithdrawalDate must be present and strictly before today
   *  - activityTypeCd must be a germ test type
   *  - germinatorTrayId must be null (no existing tray id assigned)
   * Returns a map from RIA_SKEY to the corresponding GermTestResultDto for reuse
   * during assignment (avoids calling the repository twice per activity).
   * Throws ResponseStatusException on the first validation failure.
   */
  private Map<BigDecimal, GermTestResultDto> collectAndValidateGermTestResults(
      List<GerminatorTrayCreateDto> requests
  ) {
    LocalDate today = LocalDate.now();
    String errorMessage = "Could not create germinator tray. Possible reasons: "
        + "Seed has not been withdrawn, not all tests are germination tests, "
        + "and/or a germinator tray ID is already assigned.";
    List<String> germTestCodes =
        testRegimeRepository.findAllGermTestActivityTypeCodes();

    Map<BigDecimal, GermTestResultDto> resultMap = new HashMap<>(requests.size());
    for (GerminatorTrayCreateDto req : requests) {
      GermTestResultDto germTestResult =
          testResultRepository.getGermTestResult(req.riaSkey());

      if (germTestResult == null) {
        String message = String.format(
            "No test result found for activity with RIA_SKEY %s",
            req.riaSkey()
        );
        SparLog.error(message);
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, message);
      }

      LocalDate seedWithdrawalDate = germTestResult.seedWithdrawDate();
      boolean isGermTest = germTestCodes.contains(req.activityTypeCd());

      // must be a germ test
      if (!isGermTest) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            errorMessage
        );
      }

      // seedWithdrawalDate must be present and strictly before today
      if (seedWithdrawalDate == null || !seedWithdrawalDate.isBefore(today)) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            errorMessage
        );
      }

      // germinatorTrayId must not already be assigned
      if (germTestResult.germinatorTrayId() != null) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            errorMessage
        );
      }

      // cache for reuse later (prevents duplicate DB calls)
      resultMap.put(req.riaSkey(), germTestResult);
    }

    return resultMap;
  }

  private void validateNonNegativeAbnormalCounts(ReplicateAbnormalDto rep, String repName) {
    Integer[] values = {
      rep.abnormalNumReverseEmbryo(),
      rep.abnormalNumStuntedRadicle(),
      rep.abnormalNumStuntedHypocotyl(),
      rep.abnormalNumRotten(),
      rep.abnormalNumThickenedHypocotyl(),
      rep.abnormalNumThickenedRadicle(),
      rep.abnormalNumTwisted(),
      rep.abnormalNumMegametophyteCollar(),
      rep.abnormalNumWeak(),
      rep.abnormalNumOther(),
      rep.abnormalNumPregermination()
    };

    String[] fieldNames = {
      "abnormalNumReverseEmbryo",
      "abnormalNumStuntedRadicle",
      "abnormalNumStuntedHypocotyl",
      "abnormalNumRotten",
      "abnormalNumThickenedHypocotyl",
      "abnormalNumThickenedRadicle",
      "abnormalNumTwisted",
      "abnormalNumMegametophyteCollar",
      "abnormalNumWeak",
      "abnormalNumOther",
      "abnormalNumPregermination"
    };

    for (int i = 0; i < values.length; i++) {
      if (values[i] != null && values[i] < 0) {
        throw new ResponseStatusException(
            HttpStatus.UNPROCESSABLE_ENTITY,
            "Invalid abnormal count in " + repName + ": " + fieldNames[i] + " must be >= 0");
      }
    }
  }

  private ReplicateAbnormalDto mapReplicateAbnormal(
      Integer re,
      Integer sr,
      Integer sh,
      Integer rn,
      Integer th,
      Integer tr,
      Integer tw,
      Integer cm,
      Integer weak,
      Integer other,
      Integer prgrm) {
    return new ReplicateAbnormalDto(re, sr, sh, rn, th, tr, tw, cm, weak, other, prgrm, null);
  }

  /**
   * Retrieve daily abnormal germination counts for a daily germ record. Looks up the daily abnormal
   * data by daily germ key, maps replicate abnormal counts into response DTOs, validates that
   * abnormal counts are not negative, and validates that total abnormal counts do not exceed
   * germinated seed counts for each replicate.
   *
   * <p>
   *
   * @param dailyGermSkey the surrogate key for the daily germ record
   * @return a DailyAbnormalResponseDto containing abnormal counts for replicates 1 to 4
   * @throws ResponseStatusException if the key is null (400), record is not found (404), abnormal
   *     counts are invalid (422), replicate seed totals are missing (422), or abnormal totals exceed
   *     germinated seed counts (422)
   */
  public DailyAbnormalResponseDto getDailyAbnormalCounts(BigDecimal dailyGermSkey) {
    // Validate input first
    if (dailyGermSkey == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "dailyGermSkey is required");
    }

    // Lookup entity
    DailyAbnormalEntity entity = dailyAbnormalRepository.findByDailyGermSkey(dailyGermSkey);
    if (entity == null) {
      throw new ResponseStatusException(
          HttpStatus.NOT_FOUND, "Daily abnormal counts not found for the given key");
    }

    GermCountEntity germCount =
        germCountRepository
            .findByDailyGermSkeyInAnySlot(dailyGermSkey)
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.UNPROCESSABLE_ENTITY,
                        "Unable to validate replicate totals: germination counts not found"));

    List<TestRepGermEntity> replicateRows =
        testRepGermRepository.findByRiaKeyOrderByReplicateNumber(germCount.getRiaSkey());

    if (replicateRows.size() < 4) {
      throw new ResponseStatusException(
          HttpStatus.UNPROCESSABLE_ENTITY,
          "Unable to validate replicate totals: missing replicate seed totals");
    }

    Map<Integer, Integer> totalSeedsByRep =
        replicateRows.stream()
            .collect(
                java.util.stream.Collectors.toMap(
                    r -> r.getId().getReplicateNumber(),
                    r -> nullToZero(r.getTotalNoSeeds()),
                    (a, b) -> a));

    // Map entity fields into rep1, rep2, rep3, rep4 DTOs
    ReplicateAbnormalDto rep1 =
        mapReplicateAbnormal(
            entity.getRep1NoAbnrmRe(),
            entity.getRep1NoAbnrmSr(),
            entity.getRep1NoAbnrmSh(),
            entity.getRep1NoAbnrmRn(),
            entity.getRep1NoAbnrmTh(),
            entity.getRep1NoAbnrmTr(),
            entity.getRep1NoAbnrmTw(),
            entity.getRep1NoAbnrmCm(),
            entity.getRep1NoAbnrmWeak(),
            entity.getRep1NoAbnrmOther(),
            entity.getRep1NoAbnrmPrgrm());
    ReplicateAbnormalDto rep2 =
        mapReplicateAbnormal(
            entity.getRep2NoAbnrmRe(),
            entity.getRep2NoAbnrmSr(),
            entity.getRep2NoAbnrmSh(),
            entity.getRep2NoAbnrmRn(),
            entity.getRep2NoAbnrmTh(),
            entity.getRep2NoAbnrmTr(),
            entity.getRep2NoAbnrmTw(),
            entity.getRep2NoAbnrmCm(),
            entity.getRep2NoAbnrmWeak(),
            entity.getRep2NoAbnrmOther(),
            entity.getRep2NoAbnrmPrgrm());
    ReplicateAbnormalDto rep3 =
        mapReplicateAbnormal(
            entity.getRep3NoAbnrmRe(),
            entity.getRep3NoAbnrmSr(),
            entity.getRep3NoAbnrmSh(),
            entity.getRep3NoAbnrmRn(),
            entity.getRep3NoAbnrmTh(),
            entity.getRep3NoAbnrmTr(),
            entity.getRep3NoAbnrmTw(),
            entity.getRep3NoAbnrmCm(),
            entity.getRep3NoAbnrmWeak(),
            entity.getRep3NoAbnrmOther(),
            entity.getRep3NoAbnrmPrgrm());
    ReplicateAbnormalDto rep4 =
        mapReplicateAbnormal(
            entity.getRep4NoAbnrmRe(),
            entity.getRep4NoAbnrmSr(),
            entity.getRep4NoAbnrmSh(),
            entity.getRep4NoAbnrmRn(),
            entity.getRep4NoAbnrmTh(),
            entity.getRep4NoAbnrmTr(),
            entity.getRep4NoAbnrmTw(),
            entity.getRep4NoAbnrmCm(),
            entity.getRep4NoAbnrmWeak(),
            entity.getRep4NoAbnrmOther(),
            entity.getRep4NoAbnrmPrgrm());

    // Existing non-negative checks
    validateNonNegativeAbnormalCounts(rep1, "rep1");
    validateNonNegativeAbnormalCounts(rep2, "rep2");
    validateNonNegativeAbnormalCounts(rep3, "rep3");
    validateNonNegativeAbnormalCounts(rep4, "rep4");

    // New cross-checks
    validateReplicateTotals(
        "rep1",
        rep1,
        totalSeedsByRep.getOrDefault(1, 0),
        sumGerminatedCountsForReplicate(germCount, 1));
    validateReplicateTotals(
        "rep2",
        rep2,
        totalSeedsByRep.getOrDefault(2, 0),
        sumGerminatedCountsForReplicate(germCount, 2));
    validateReplicateTotals(
        "rep3",
        rep3,
        totalSeedsByRep.getOrDefault(3, 0),
        sumGerminatedCountsForReplicate(germCount, 3));
    validateReplicateTotals(
        "rep4",
        rep4,
        totalSeedsByRep.getOrDefault(4, 0),
        sumGerminatedCountsForReplicate(germCount, 4));

    DailyAbnormalResponseDto response =
        new DailyAbnormalResponseDto(entity.getDailyGermSkey(), rep1, rep2, rep3, rep4);

    return response;
  }

  private int nullToZero(Integer value) {
    return value == null ? 0 : value;
  }

  private int sumAbnormalCounts(ReplicateAbnormalDto rep) {
    return nullToZero(rep.abnormalNumReverseEmbryo())
        + nullToZero(rep.abnormalNumStuntedRadicle())
        + nullToZero(rep.abnormalNumStuntedHypocotyl())
        + nullToZero(rep.abnormalNumRotten())
        + nullToZero(rep.abnormalNumThickenedHypocotyl())
        + nullToZero(rep.abnormalNumThickenedRadicle())
        + nullToZero(rep.abnormalNumTwisted())
        + nullToZero(rep.abnormalNumMegametophyteCollar())
        + nullToZero(rep.abnormalNumWeak())
        + nullToZero(rep.abnormalNumOther())
        + nullToZero(rep.abnormalNumPregermination());
  }

  private static final List<Function<GermCountEntity, Integer>> REP1_GERM_GETTERS =
      List.of(
          GermCountEntity::getRep1NoSeedsGerm1,
          GermCountEntity::getRep1NoSeedsGerm2,
          GermCountEntity::getRep1NoSeedsGerm3,
          GermCountEntity::getRep1NoSeedsGerm4,
          GermCountEntity::getRep1NoSeedsGerm5,
          GermCountEntity::getRep1NoSeedsGerm6,
          GermCountEntity::getRep1NoSeedsGerm7,
          GermCountEntity::getRep1NoSeedsGerm8,
          GermCountEntity::getRep1NoSeedsGerm9,
          GermCountEntity::getRep1NoSeedsGerm10,
          GermCountEntity::getRep1NoSeedsGerm11,
          GermCountEntity::getRep1NoSeedsGerm12,
          GermCountEntity::getRep1NoSeedsGerm13);

  private static final List<Function<GermCountEntity, Integer>> REP2_GERM_GETTERS =
      List.of(
          GermCountEntity::getRep2NoSeedsGerm1,
          GermCountEntity::getRep2NoSeedsGerm2,
          GermCountEntity::getRep2NoSeedsGerm3,
          GermCountEntity::getRep2NoSeedsGerm4,
          GermCountEntity::getRep2NoSeedsGerm5,
          GermCountEntity::getRep2NoSeedsGerm6,
          GermCountEntity::getRep2NoSeedsGerm7,
          GermCountEntity::getRep2NoSeedsGerm8,
          GermCountEntity::getRep2NoSeedsGerm9,
          GermCountEntity::getRep2NoSeedsGerm10,
          GermCountEntity::getRep2NoSeedsGerm11,
          GermCountEntity::getRep2NoSeedsGerm12,
          GermCountEntity::getRep2NoSeedsGerm13);

  private static final List<Function<GermCountEntity, Integer>> REP3_GERM_GETTERS =
      List.of(
          GermCountEntity::getRep3NoSeedsGerm1,
          GermCountEntity::getRep3NoSeedsGerm2,
          GermCountEntity::getRep3NoSeedsGerm3,
          GermCountEntity::getRep3NoSeedsGerm4,
          GermCountEntity::getRep3NoSeedsGerm5,
          GermCountEntity::getRep3NoSeedsGerm6,
          GermCountEntity::getRep3NoSeedsGerm7,
          GermCountEntity::getRep3NoSeedsGerm8,
          GermCountEntity::getRep3NoSeedsGerm9,
          GermCountEntity::getRep3NoSeedsGerm10,
          GermCountEntity::getRep3NoSeedsGerm11,
          GermCountEntity::getRep3NoSeedsGerm12,
          GermCountEntity::getRep3NoSeedsGerm13);

  private static final List<Function<GermCountEntity, Integer>> REP4_GERM_GETTERS =
      List.of(
          GermCountEntity::getRep4NoSeedsGerm1,
          GermCountEntity::getRep4NoSeedsGerm2,
          GermCountEntity::getRep4NoSeedsGerm3,
          GermCountEntity::getRep4NoSeedsGerm4,
          GermCountEntity::getRep4NoSeedsGerm5,
          GermCountEntity::getRep4NoSeedsGerm6,
          GermCountEntity::getRep4NoSeedsGerm7,
          GermCountEntity::getRep4NoSeedsGerm8,
          GermCountEntity::getRep4NoSeedsGerm9,
          GermCountEntity::getRep4NoSeedsGerm10,
          GermCountEntity::getRep4NoSeedsGerm11,
          GermCountEntity::getRep4NoSeedsGerm12,
          GermCountEntity::getRep4NoSeedsGerm13);

  private int sumGerminatedCountsForReplicate(GermCountEntity gc, int replicateNo) {
    List<Function<GermCountEntity, Integer>> getters =
        switch (replicateNo) {
          case 1 -> REP1_GERM_GETTERS;
          case 2 -> REP2_GERM_GETTERS;
          case 3 -> REP3_GERM_GETTERS;
          case 4 -> REP4_GERM_GETTERS;
          default -> throw new IllegalArgumentException("replicateNo must be 1..4");
        };
    return getters.stream().mapToInt(g -> nullToZero(g.apply(gc))).sum();
  }

  private void validateReplicateTotals(
      String repName, ReplicateAbnormalDto abnormal, int totalSeeds, int germinatedTotal) {

    int abnormalTotal = sumAbnormalCounts(abnormal);

    if (germinatedTotal > totalSeeds) {
      throw new ResponseStatusException(
          HttpStatus.UNPROCESSABLE_ENTITY, repName + " germinated total exceeds total seeds");
    }

    if (germinatedTotal + abnormalTotal > totalSeeds) {
      throw new ResponseStatusException(
          HttpStatus.UNPROCESSABLE_ENTITY,
          repName + " germinated + abnormal total exceeds total seeds");
    }
  }

  /**
   * Determine the default test rank for a seedlot.
   * Returns:
   * - "A" when no accepted STD rank-A test exists for the seedlot
   * - "P" when an accepted STD rank-A test already exists
   * - null when rank rules do not apply (non-STD or not accepted)
   */
  public String determineTestRank(
      String seedlotNumber, String testCategoryCd, Integer acceptResultInd) {
    SparLog.info(
        "Determining test rank for seedlot={}, testCategoryCd={}, acceptResultInd={}",
        seedlotNumber,
        testCategoryCd,
        acceptResultInd);

    if (seedlotNumber == null || seedlotNumber.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "seedlotNumber is required");
    }

    // Rule applies only to accepted STD tests
    if (!"STD".equalsIgnoreCase(testCategoryCd) || !Integer.valueOf(1).equals(acceptResultInd)) {
      SparLog.info(
          "Rank logic not applicable for seedlot={} because testCategoryCd={} or"
              + " acceptResultInd={}",
          seedlotNumber,
          testCategoryCd,
          acceptResultInd);
      return null;
    }

    long existingAcceptedStdRankA = testResultRepository.countAcceptedStdRankA(seedlotNumber);
    String rank = existingAcceptedStdRankA > 0 ? "P" : "A";

    SparLog.info(
        "Determined test rank={} for seedlot={} (existing accepted STD rank-A count={})",
        rank,
        seedlotNumber,
        existingAcceptedStdRankA);

    return rank;
  }
}
