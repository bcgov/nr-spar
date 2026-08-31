package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.DailyAbnormalResponseDto;
import ca.bc.gov.oracleapi.dto.consep.DailyAbnormalUpsertRequestDto;
import ca.bc.gov.oracleapi.dto.consep.GerminationTestUpdateFormDto;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** The class for Moisture Content Cones Service and test result service. */
@Service
@RequiredArgsConstructor
public class TestResultService {

  /** Rank "A" is the primary/best rank assigned to the first accepted STD germination test. */
  private static final String RANK_A = "A";

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
          dto.requestTypeSt(),
          dto.testResultUpdateTimestamp(),
          dto.riaUpdateTimestamp());

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
   * Create or replace daily abnormal germination counts for a daily germ record.
   *
   * @param dailyGermSkey the surrogate key for the daily germ record
   * @param request the abnormal counts for all four replicates
   * @return the saved daily abnormal counts
   */
  @Transactional
  public DailyAbnormalResponseDto upsertDailyAbnormalCounts(
      BigDecimal dailyGermSkey, DailyAbnormalUpsertRequestDto request) {
    GermCountEntity germCount =
        germCountRepository
            .findByDailyGermSkeyInAnySlot(dailyGermSkey)
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Daily germ record not found for the given key"));

    DailyAbnormalEntity entity = dailyAbnormalRepository.findByDailyGermSkey(dailyGermSkey);
    if (entity == null) {
      entity = new DailyAbnormalEntity();
      entity.setDailyGermSkey(dailyGermSkey);
    }

    applyReplicateAbnormal(entity, 1, request.rep1());
    applyReplicateAbnormal(entity, 2, request.rep2());
    applyReplicateAbnormal(entity, 3, request.rep3());
    applyReplicateAbnormal(entity, 4, request.rep4());

    validateDailyAbnormalTotals(entity, germCount, dailyGermSkey);
    DailyAbnormalEntity savedEntity = dailyAbnormalRepository.save(entity);

    return toDailyAbnormalResponseDto(savedEntity);
  }

    private DailyAbnormalResponseDto toDailyAbnormalResponseDto(DailyAbnormalEntity entity) {
    return new DailyAbnormalResponseDto(
      entity.getDailyGermSkey(),
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
        entity.getRep1NoAbnrmPrgrm()),
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
        entity.getRep2NoAbnrmPrgrm()),
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
        entity.getRep3NoAbnrmPrgrm()),
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
        entity.getRep4NoAbnrmPrgrm()));
    }

  private void applyReplicateAbnormal(
      DailyAbnormalEntity entity, int replicateNumber, ReplicateAbnormalDto abnormal) {
    switch (replicateNumber) {
      case 1 -> {
        entity.setRep1NoAbnrmRe(abnormal.abnormalNumReverseEmbryo());
        entity.setRep1NoAbnrmSr(abnormal.abnormalNumStuntedRadicle());
        entity.setRep1NoAbnrmSh(abnormal.abnormalNumStuntedHypocotyl());
        entity.setRep1NoAbnrmRn(abnormal.abnormalNumRotten());
        entity.setRep1NoAbnrmTh(abnormal.abnormalNumThickenedHypocotyl());
        entity.setRep1NoAbnrmTr(abnormal.abnormalNumThickenedRadicle());
        entity.setRep1NoAbnrmTw(abnormal.abnormalNumTwisted());
        entity.setRep1NoAbnrmCm(abnormal.abnormalNumMegametophyteCollar());
        entity.setRep1NoAbnrmWeak(abnormal.abnormalNumWeak());
        entity.setRep1NoAbnrmOther(abnormal.abnormalNumOther());
        entity.setRep1NoAbnrmPrgrm(abnormal.abnormalNumPregermination());
      }
      case 2 -> {
        entity.setRep2NoAbnrmRe(abnormal.abnormalNumReverseEmbryo());
        entity.setRep2NoAbnrmSr(abnormal.abnormalNumStuntedRadicle());
        entity.setRep2NoAbnrmSh(abnormal.abnormalNumStuntedHypocotyl());
        entity.setRep2NoAbnrmRn(abnormal.abnormalNumRotten());
        entity.setRep2NoAbnrmTh(abnormal.abnormalNumThickenedHypocotyl());
        entity.setRep2NoAbnrmTr(abnormal.abnormalNumThickenedRadicle());
        entity.setRep2NoAbnrmTw(abnormal.abnormalNumTwisted());
        entity.setRep2NoAbnrmCm(abnormal.abnormalNumMegametophyteCollar());
        entity.setRep2NoAbnrmWeak(abnormal.abnormalNumWeak());
        entity.setRep2NoAbnrmOther(abnormal.abnormalNumOther());
        entity.setRep2NoAbnrmPrgrm(abnormal.abnormalNumPregermination());
      }
      case 3 -> {
        entity.setRep3NoAbnrmRe(abnormal.abnormalNumReverseEmbryo());
        entity.setRep3NoAbnrmSr(abnormal.abnormalNumStuntedRadicle());
        entity.setRep3NoAbnrmSh(abnormal.abnormalNumStuntedHypocotyl());
        entity.setRep3NoAbnrmRn(abnormal.abnormalNumRotten());
        entity.setRep3NoAbnrmTh(abnormal.abnormalNumThickenedHypocotyl());
        entity.setRep3NoAbnrmTr(abnormal.abnormalNumThickenedRadicle());
        entity.setRep3NoAbnrmTw(abnormal.abnormalNumTwisted());
        entity.setRep3NoAbnrmCm(abnormal.abnormalNumMegametophyteCollar());
        entity.setRep3NoAbnrmWeak(abnormal.abnormalNumWeak());
        entity.setRep3NoAbnrmOther(abnormal.abnormalNumOther());
        entity.setRep3NoAbnrmPrgrm(abnormal.abnormalNumPregermination());
      }
      case 4 -> {
        entity.setRep4NoAbnrmRe(abnormal.abnormalNumReverseEmbryo());
        entity.setRep4NoAbnrmSr(abnormal.abnormalNumStuntedRadicle());
        entity.setRep4NoAbnrmSh(abnormal.abnormalNumStuntedHypocotyl());
        entity.setRep4NoAbnrmRn(abnormal.abnormalNumRotten());
        entity.setRep4NoAbnrmTh(abnormal.abnormalNumThickenedHypocotyl());
        entity.setRep4NoAbnrmTr(abnormal.abnormalNumThickenedRadicle());
        entity.setRep4NoAbnrmTw(abnormal.abnormalNumTwisted());
        entity.setRep4NoAbnrmCm(abnormal.abnormalNumMegametophyteCollar());
        entity.setRep4NoAbnrmWeak(abnormal.abnormalNumWeak());
        entity.setRep4NoAbnrmOther(abnormal.abnormalNumOther());
        entity.setRep4NoAbnrmPrgrm(abnormal.abnormalNumPregermination());
      }
      default -> throw new IllegalArgumentException("replicateNumber must be 1..4");
    }
  }

  private void validateDailyAbnormalTotals(
      DailyAbnormalEntity entity, GermCountEntity germCount, BigDecimal dailyGermSkey) {
    int matchedSlot = findMatchedDailyGermSlot(germCount, dailyGermSkey);
    if (matchedSlot == -1) {
      throw new ResponseStatusException(
          HttpStatus.NOT_FOUND, "Daily germ record not found for the given key");
    }

    List<TestRepGermEntity> replicateRows =
        testRepGermRepository.findByRiaKeyOrderByReplicateNumber(germCount.getRiaSkey());
    Map<Integer, Integer> totalSeedsByRep =
        replicateRows.stream()
            .collect(
                Collectors.toMap(
                    row -> row.getId().getReplicateNumber(),
                    row -> nullToZero(row.getTotalNoSeeds()),
                    (first, ignored) -> first));

    if (!totalSeedsByRep.keySet().containsAll(List.of(1, 2, 3, 4))) {
      throw new ResponseStatusException(
          HttpStatus.UNPROCESSABLE_ENTITY,
          "Unable to validate replicate totals: missing replicate seed totals");
    }

    ReplicateAbnormalDto rep1 = mapReplicateAbnormal(
        entity.getRep1NoAbnrmRe(), entity.getRep1NoAbnrmSr(), entity.getRep1NoAbnrmSh(),
        entity.getRep1NoAbnrmRn(), entity.getRep1NoAbnrmTh(), entity.getRep1NoAbnrmTr(),
        entity.getRep1NoAbnrmTw(), entity.getRep1NoAbnrmCm(), entity.getRep1NoAbnrmWeak(),
        entity.getRep1NoAbnrmOther(), entity.getRep1NoAbnrmPrgrm());
    ReplicateAbnormalDto rep2 = mapReplicateAbnormal(
        entity.getRep2NoAbnrmRe(), entity.getRep2NoAbnrmSr(), entity.getRep2NoAbnrmSh(),
        entity.getRep2NoAbnrmRn(), entity.getRep2NoAbnrmTh(), entity.getRep2NoAbnrmTr(),
        entity.getRep2NoAbnrmTw(), entity.getRep2NoAbnrmCm(), entity.getRep2NoAbnrmWeak(),
        entity.getRep2NoAbnrmOther(), entity.getRep2NoAbnrmPrgrm());
    ReplicateAbnormalDto rep3 = mapReplicateAbnormal(
        entity.getRep3NoAbnrmRe(), entity.getRep3NoAbnrmSr(), entity.getRep3NoAbnrmSh(),
        entity.getRep3NoAbnrmRn(), entity.getRep3NoAbnrmTh(), entity.getRep3NoAbnrmTr(),
        entity.getRep3NoAbnrmTw(), entity.getRep3NoAbnrmCm(), entity.getRep3NoAbnrmWeak(),
        entity.getRep3NoAbnrmOther(), entity.getRep3NoAbnrmPrgrm());
    ReplicateAbnormalDto rep4 = mapReplicateAbnormal(
        entity.getRep4NoAbnrmRe(), entity.getRep4NoAbnrmSr(), entity.getRep4NoAbnrmSh(),
        entity.getRep4NoAbnrmRn(), entity.getRep4NoAbnrmTh(), entity.getRep4NoAbnrmTr(),
        entity.getRep4NoAbnrmTw(), entity.getRep4NoAbnrmCm(), entity.getRep4NoAbnrmWeak(),
        entity.getRep4NoAbnrmOther(), entity.getRep4NoAbnrmPrgrm());

    validateNonNegativeAbnormalCounts(rep1, "rep1");
    validateNonNegativeAbnormalCounts(rep2, "rep2");
    validateNonNegativeAbnormalCounts(rep3, "rep3");
    validateNonNegativeAbnormalCounts(rep4, "rep4");

    validateReplicateTotals(
        "rep1", rep1, totalSeedsByRep.get(1),
        sumGerminatedCountsForReplicateUpToSlot(germCount, 1, matchedSlot));
    validateReplicateTotals(
        "rep2", rep2, totalSeedsByRep.get(2),
        sumGerminatedCountsForReplicateUpToSlot(germCount, 2, matchedSlot));
    validateReplicateTotals(
        "rep3", rep3, totalSeedsByRep.get(3),
        sumGerminatedCountsForReplicateUpToSlot(germCount, 3, matchedSlot));
    validateReplicateTotals(
        "rep4", rep4, totalSeedsByRep.get(4),
        sumGerminatedCountsForReplicateUpToSlot(germCount, 4, matchedSlot));
  }

  /**
   * Retrieve daily abnormal germination counts for a daily germ record. Looks up the daily abnormal
   * data by daily germ key, maps replicate abnormal counts into response DTOs, validates that
   * abnormal counts are not negative, and validates that the combined germinated and abnormal
   * totals do not exceed the total seed count for each replicate.
   *
   * <p>
   *
   * @param dailyGermSkey the surrogate key for the daily germ record
   * @return a DailyAbnormalResponseDto containing abnormal counts for replicates 1 to 4
   * @throws ResponseStatusException if the key is null (400), record is not found (404), abnormal
   *     counts are invalid (422), replicate seed totals are missing (422), or the combined
   *     germinated and abnormal totals exceed the replicate total seed count (422)
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

    Map<Integer, Integer> totalSeedsByRep =
        replicateRows.stream()
            .collect(
                Collectors.toMap(
                    r -> r.getId().getReplicateNumber(),
                    r -> nullToZero(r.getTotalNoSeeds()),
                    (a, b) -> a));

    if (!totalSeedsByRep.keySet().containsAll(List.of(1, 2, 3, 4))) {
      throw new ResponseStatusException(
          HttpStatus.UNPROCESSABLE_ENTITY,
          "Unable to validate replicate totals: missing replicate seed totals");
    }

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
    int matchedSlot = findMatchedDailyGermSlot(germCount, dailyGermSkey);

    if (matchedSlot == -1) {
      throw new ResponseStatusException(
          HttpStatus.UNPROCESSABLE_ENTITY,
          "Unable to validate replicate totals: daily germ key not found in germination slots");
    }

    validateReplicateTotals(
        "rep1",
        rep1,
        totalSeedsByRep.get(1),
        sumGerminatedCountsForReplicateUpToSlot(germCount, 1, matchedSlot));
    validateReplicateTotals(
        "rep2",
        rep2,
        totalSeedsByRep.get(2),
        sumGerminatedCountsForReplicateUpToSlot(germCount, 2, matchedSlot));
    validateReplicateTotals(
        "rep3",
        rep3,
        totalSeedsByRep.get(3),
        sumGerminatedCountsForReplicateUpToSlot(germCount, 3, matchedSlot));
    validateReplicateTotals(
        "rep4",
        rep4,
        totalSeedsByRep.get(4),
        sumGerminatedCountsForReplicateUpToSlot(germCount, 4, matchedSlot));

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

  private int findMatchedDailyGermSlot(GermCountEntity gc, BigDecimal dailyGermSkey) {
    if (dailyGermSkey == null) {
      return -1;
    }

    BigDecimal[] slots = {
      gc.getDailyGermSkey1(),
      gc.getDailyGermSkey2(),
      gc.getDailyGermSkey3(),
      gc.getDailyGermSkey4(),
      gc.getDailyGermSkey5(),
      gc.getDailyGermSkey6(),
      gc.getDailyGermSkey7(),
      gc.getDailyGermSkey8(),
      gc.getDailyGermSkey9(),
      gc.getDailyGermSkey10(),
      gc.getDailyGermSkey11(),
      gc.getDailyGermSkey12(),
      gc.getDailyGermSkey13()
    };

    for (int i = 0; i < slots.length; i++) {
      if (slots[i] != null && dailyGermSkey.compareTo(slots[i]) == 0) {
        return i + 1; // 1..13
      }
    }

    return -1;
  }

  private int sumGerminatedCountsForReplicateUpToSlot(
      GermCountEntity gc, int replicateNo, int slotInclusive) {
    if (slotInclusive < 1 || slotInclusive > 13) {
      throw new IllegalArgumentException("slotInclusive must be 1..13");
    }

    List<Function<GermCountEntity, Integer>> getters =
        switch (replicateNo) {
          case 1 -> REP1_GERM_GETTERS;
          case 2 -> REP2_GERM_GETTERS;
          case 3 -> REP3_GERM_GETTERS;
          case 4 -> REP4_GERM_GETTERS;
          default -> throw new IllegalArgumentException("replicateNo must be 1..4");
        };
    return getters.stream().limit(slotInclusive).mapToInt(g -> nullToZero(g.apply(gc))).sum();
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
   * Update a germination test header and its activity as a single unit.
   * Implements issue #2447 / Confluence "Update (test and activity)".
   *
   * @param riaKey the test's RIA key
   * @param dto the fields to update
   * @return the refreshed germination test header
   */
  @Transactional
  public GerminationTestHeaderDto updateGerminationTest(
      BigDecimal riaKey, GerminationTestUpdateFormDto dto) {

    TestResultEntity storedTest = testResultRepository.findById(riaKey)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, "No germination test found for riaKey " + riaKey));
    ActivityEntity storedActivity = activityRepository.findById(riaKey)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, "No activity found for riaKey " + riaKey));

    boolean accept = Boolean.TRUE.equals(dto.acceptResultInd());
    boolean complete = Boolean.TRUE.equals(dto.testCompleteInd());

    // Spec: when Complete is checked, Test End defaults to now. Resolved before
    // validation so the end-after-begin rule also covers the defaulted value.
    LocalDateTime effectiveEnd = dto.actualEndDateTime();
    if (complete && effectiveEnd == null) {
      effectiveEnd = LocalDateTime.now();
    }

    validateGerminationTestUpdate(dto, storedTest, accept, complete, effectiveEnd);

    String seedlotNumber = storedActivity.getSeedlotNumber();
    String activityType = storedTest.getActivityType();
    String category = dto.testCategoryCode();

    int[] flags = computeOriginalCurrentFlags(
        accept, effectiveEnd, seedlotNumber, activityType, category);
    int updOriginal = flags[0];
    int updCurrent = flags[1];

    String updRank = computeRankUpdate(
        accept, category, seedlotNumber, riaKey, updOriginal, updCurrent);

    boolean storedComplete = storedTest.getTestCompleteInd() != null
        && storedTest.getTestCompleteInd() != 0;
    if (complete && !storedComplete) {
      testResultRepository.deleteAssignedGermLocation(riaKey);
    }

    int testRows = testResultRepository.updateGerminationTestHeader(
        riaKey, updOriginal, updCurrent, updRank,
        complete ? -1 : 0, accept ? -1 : 0,
        dto.germinatorId(), dto.seedWithdrawalDate(), category,
        dto.testResultUpdateTimestamp());
    if (testRows == 0) {
      throw new ResponseStatusException(HttpStatus.CONFLICT,
          "Test result was modified by another user; reload and retry");
    }

    int activityRows = activityRepository.updateGerminationTestActivity(
        riaKey, dto.actualBeginDateTime(), effectiveEnd,
        dto.actualBeginDateTime() == null ? null : dto.actualBeginDateTime().toLocalDate(),
        computeRevisedEndDate(effectiveEnd, dto.actualBeginDateTime(),
            storedActivity.getActivityDuration(), storedActivity.getActivityTimeUnit()),
        dto.riaComment(),
        Boolean.TRUE.equals(dto.commentIsCritical()) ? -1 : 0,
        dto.riaUpdateTimestamp());
    if (activityRows == 0) {
      throw new ResponseStatusException(HttpStatus.CONFLICT,
          "Activity was modified by another user; reload and retry");
    }

    if (updOriginal == -1) {
      testResultRepository.resetOriginalTestIndForSiblings(
          riaKey, activityType, category, seedlotNumber);
    }
    if (updCurrent == -1) {
      testResultRepository.resetCurrentTestIndForSiblings(
          riaKey, activityType, category, seedlotNumber);
    }

    GerminationTestHeaderDto refreshed = testResultRepository
        .findGerminationTestHeaderByRiaKey(riaKey)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, "No germination test found for riaKey " + riaKey));

    // Spec: "the first completed activity processes the commitment" — skip if a sibling activity
    // already has processCommitIndicator set (findConflictingActivities non-empty).
    if (complete && ("RTS".equals(refreshed.requestTypeSt())
        || "TST".equals(refreshed.requestTypeSt()))) {
      boolean alreadyProcessed = !activityRepository.findConflictingActivities(
          riaKey, storedActivity.getRequestSkey(), storedActivity.getItemId()).isEmpty();
      if (!alreadyProcessed) {
        activityRepository.markSignificantAndCommit(riaKey);
      }
    }

    return refreshed;
  }

  /**
   * Computes the original-test and current-test flag values for a germination test update.
   *
   * <p>Returns an {@code int[2]} where index 0 is {@code updOriginal} and index 1 is
   * {@code updCurrent}. Each value is {@code -1} (set) or {@code 0} (leave unchanged).
   *
   * <p>Note: accept =&gt; complete =&gt; effectiveEnd non-null
   * (enforced in validateGerminationTestUpdate).
   *
   * @param accept whether the test is being accepted
   * @param effectiveEnd the resolved test-end timestamp (non-null when accept is true)
   * @param seedlotNumber the seedlot number
   * @param activityType the activity type code
   * @param category the test category code
   * @return int[2] with [updOriginal, updCurrent]
   */
  private int[] computeOriginalCurrentFlags(
      boolean accept, LocalDateTime effectiveEnd,
      String seedlotNumber, String activityType, String category) {

    int updOriginal = 0;
    int updCurrent = 0;
    if (accept) {
      // accept => complete => effectiveEnd non-null (enforced in validateGerminationTestUpdate)
      LocalDateTime minEnd = testResultRepository
          .findMinCompletedAcceptedEndDate(seedlotNumber, activityType, category);
      LocalDateTime maxEnd = testResultRepository
          .findMaxCompletedAcceptedEndDate(seedlotNumber, activityType, category);
      // Field-description semantics: current stays set unless some test ends
      // strictly LATER; original unless some test ends strictly EARLIER. Ties
      // (e.g. re-saving the same test) therefore keep the flag.
      if (maxEnd == null || !effectiveEnd.isBefore(maxEnd)) {
        updCurrent = -1;
      }
      if (minEnd == null || !effectiveEnd.isAfter(minEnd)) {
        updOriginal = -1;
      }
    }
    return new int[]{updOriginal, updCurrent};
  }

  /**
   * Determines the rank value to write when accepting a STD germination test.
   *
   * <p>Returns {@value #RANK_A} when this test should become the primary (rank A) result,
   * or {@code null} when no rank change is needed.
   *
   * @param accept whether the test is being accepted
   * @param category the test category code
   * @param seedlotNumber the seedlot number
   * @param riaKey the test's RIA key (used to exclude self from sibling checks)
   * @param updOriginal the original-test flag computed by {@link #computeOriginalCurrentFlags}
   * @param updCurrent the current-test flag computed by {@link #computeOriginalCurrentFlags}
   * @return rank string or {@code null}
   */
  private String computeRankUpdate(
      boolean accept, String category, String seedlotNumber,
      BigDecimal riaKey, int updOriginal, int updCurrent) {

    if (!"STD".equals(category) || !accept) {
      return null;
    }
    List<TestResultEntity> rankATests =
        testResultRepository.findRankATestsBySeedlot(seedlotNumber);
    boolean anotherTestIsCurrent = rankATests.stream()
        .anyMatch(t -> t.getCurrentTest() != null && t.getCurrentTest() != 0
            && !riaKey.equals(t.getRiaKey()));
    if (updOriginal == -1 && updCurrent == -1 && rankATests.isEmpty()) {
      return RANK_A;
    } else if (updCurrent == -1 && anotherTestIsCurrent) {
      return RANK_A;
    }
    return null;
  }

  private LocalDate computeRevisedEndDate(
      LocalDateTime effectiveEnd, LocalDateTime begin,
      Integer duration, String timeUnit) {
    if (effectiveEnd != null) {
      return effectiveEnd.toLocalDate();
    }
    if (begin == null || duration == null) {
      return null;
    }
    return switch (timeUnit == null ? "DY" : timeUnit) {
      case "HR" -> begin.plusHours(duration).toLocalDate();
      case "WK" -> begin.plusWeeks(duration).toLocalDate();
      case "MO" -> begin.plusMonths(duration).toLocalDate();
      case "YR" -> begin.plusYears(duration).toLocalDate();
      default -> begin.plusDays(duration).toLocalDate();
    };
  }

  private void validateGerminationTestUpdate(
      GerminationTestUpdateFormDto dto, TestResultEntity storedTest,
      boolean accept, boolean complete, LocalDateTime effectiveEnd) {

    if (accept && !complete) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
          "Cannot accept a test that has not been marked as complete");
    }

    boolean beginRequired = accept || complete
        || (dto.riaComment() != null && !dto.riaComment().isBlank())
        || dto.actualEndDateTime() != null;
    if (beginRequired && dto.actualBeginDateTime() == null) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
          "Begin date is mandatory when the test is accepted or complete,"
              + " or a comment or test end is provided");
    }

    if (dto.actualBeginDateTime() != null && effectiveEnd != null
        && !effectiveEnd.isAfter(dto.actualBeginDateTime())) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
          "Test end must be after begin date");
    }

    LocalDateTime now = LocalDateTime.now();
    if (dto.actualBeginDateTime() != null && dto.actualBeginDateTime().isAfter(now)) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
          "Begin date cannot be in the future");
    }
    if (dto.seedWithdrawalDate() != null
        && dto.seedWithdrawalDate().isAfter(now.toLocalDate())) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
          "Seed withdrawal date cannot be in the future");
    }

    boolean storedComplete = storedTest.getTestCompleteInd() != null
        && storedTest.getTestCompleteInd() != 0;
    if (storedComplete
        && !dto.testCategoryCode().equals(storedTest.getTestCategory())) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
          "Category cannot be updated once the test is complete");
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
    String rank = existingAcceptedStdRankA > 0 ? "P" : RANK_A;

    SparLog.info(
        "Determined test rank={} for seedlot={} (existing accepted STD rank-A count={})",
        rank,
        seedlotNumber,
        existingAcceptedStdRankA);

    return rank;
  }
}
