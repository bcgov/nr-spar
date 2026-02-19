package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.GermTestResultDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayCreateDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayCreateResponseDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.repository.consep.ActivityRepository;
import ca.bc.gov.oracleapi.repository.consep.GerminatorTrayRepository;
import ca.bc.gov.oracleapi.repository.consep.TestRegimeRepository;
import ca.bc.gov.oracleapi.repository.consep.TestResultRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
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

    // Loop per test type
    for (Map.Entry<String, List<GerminatorTrayCreateDto>> entry : groupedByActivityType.entrySet()) {

      String activityTypeCd = entry.getKey();
      List<GerminatorTrayCreateDto> activities = entry.getValue();

      SparLog.info(
          "Creating germinator trays for test type {} with {} activities",
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
                "Skipping commitment processing for activity {} because requestSkey or itemId is null",
                activityRiaSkey
            );
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
   *  - seedWithdrawalDate must be present and strictly after today
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
    String errorMessage = "Failed to create germinator tray: validation failed "
        + "— ensure seeds have not been withdrawn, all tests are germination tests, "
        + "and no germinator tray ID is already assigned.";
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

      // seedWithdrawalDate must be present and strictly after today
      if (seedWithdrawalDate == null || !seedWithdrawalDate.isAfter(today)) {
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
}
