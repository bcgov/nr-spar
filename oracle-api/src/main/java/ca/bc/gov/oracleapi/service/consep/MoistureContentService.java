package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.MoistureContentConesDto;
import ca.bc.gov.oracleapi.dto.consep.ReplicateDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.entity.consep.ReplicateEntity;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.exception.InvalidMccKeyException;
import ca.bc.gov.oracleapi.repository.consep.ActivityRepository;
import ca.bc.gov.oracleapi.repository.consep.ReplicateRepository;
import ca.bc.gov.oracleapi.repository.consep.TestResultRepository;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** The class for Moisture Content Cones Service. */
@Service
@RequiredArgsConstructor
public class MoistureContentService {

  private final ActivityRepository activityRepository;

  private final TestResultRepository testResultRepository;

  private final ReplicateRepository replicateRepository;

  // The maximum number of replicates is 8 and the entries are sequencial,
  // so we can use a fixed list to fetch the data for the replicates.
  private final List<Integer> replicateIds =
      IntStream.rangeClosed(1, 8).boxed().collect(Collectors.toList());


  /**
   * Get information for moisture cone content.
   */
  public Optional<MoistureContentConesDto> getMoistureConeContentData(BigDecimal riaKey) {
    SparLog.info("Begin to query necessary tables for moisture cone content");

    Optional<ActivityEntity> activityData = activityRepository.findById(riaKey);

    Optional<TestResultEntity> testResultData = testResultRepository.findById(riaKey);

    List<ReplicateEntity> replicates =
        replicateRepository.findByRiaKeyAndReplicateNumbers(riaKey, replicateIds);

    if (activityData.isEmpty() || testResultData.isEmpty() || replicates.isEmpty()) {
      SparLog.warn("No data found for RIA_SKEY: {}", riaKey);
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No data found for given RIA_SKEY");
    }

    List<ReplicateDto> replicatesList = replicates.stream().map(
        (curReplicate) -> new ReplicateDto(
            curReplicate.getId().getRiaKey(),
            curReplicate.getId().getReplicateNumber(),
            curReplicate.getContainerId(),
            curReplicate.getContainerWeight(),
            curReplicate.getFreshSeed(),
            curReplicate.getContainerAndDryWeight(),
            curReplicate.getDryWeight(),
            curReplicate.getReplicateAccInd(),
            curReplicate.getReplicateComment(),
            curReplicate.getOverrideReason()))
        .collect(Collectors.toList());

    MoistureContentConesDto moistureContent =
        new MoistureContentConesDto(
            testResultData.get().getTestCompleteInd(),
            testResultData.get().getSampleDesc(),
            testResultData.get().getMoistureStatus(),
            testResultData.get().getMoisturePct(),
            testResultData.get().getAcceptResult(),
            activityData.get().getRequestId(),
            activityData.get().getSeedlotNumber(),
            activityData.get().getActivityTypeCode(),
            activityData.get().getTestCategoryCode(),
            activityData.get().getRiaComment(),
            activityData.get().getActualBeginDateTime(),
            activityData.get().getActualEndDateTime(),
            replicatesList);

    SparLog.info("MCC data correctly fetched");
    return Optional.of(moistureContent);
  }

  /**
   * This function validates the data to be submitted for MCC.
   * Throws exception if validation fails
   *
   * @param moistureContentConesDataDtos a list of replicates to validate
   * @throws ResponseStatusException if any validation fails
   */
  public void validateMoistureConeContentData(List<ReplicateDto> moistureContentConesDataDtos) {
    SparLog.info("Validating MCC data");
    // Validate the data
    for (ReplicateDto replicate : moistureContentConesDataDtos) {

      if (replicate.riaKey() == null) {
        SparLog.error("MCC data validation failed: RIA key is missing");
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "RIA key is missing");
      }

      if (replicate.replicateNumber() == null) {
        SparLog.error("MCC data validation failed: Replicate number is missing");
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Replicate number is missing");
      }

      if (replicate.containerId() != null && replicate.containerId().length() > 4) {
        SparLog.error("MCC data validation failed: Container ID is too long");
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Container ID is too long");
      }

      if (replicate.containerWeight() == null
          || replicate.containerWeight().compareTo(BigDecimal.ZERO) < 0
          || replicate.containerWeight().compareTo(BigDecimal.valueOf(999.999)) > 0) {
        SparLog.error("MCC data validation failed: Container weight is missing or invalid");
        throw new ResponseStatusException(
           HttpStatus.BAD_REQUEST,
           "Container weight is missing or invalid");
      }

      if (replicate.freshSeed() == null
          || replicate.freshSeed().compareTo(BigDecimal.ZERO) < 0
          || replicate.freshSeed().compareTo(BigDecimal.valueOf(999.999)) > 0) {
        SparLog.error("MCC data validation failed: Fresh seed weight is missing or invalid");
        throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Fresh seed weight is missing or invalid");
      }

      if (replicate.dryWeight() == null
          || replicate.dryWeight().compareTo(BigDecimal.ZERO) < 0
          || replicate.dryWeight().compareTo(BigDecimal.valueOf(999.999)) > 0) {
        SparLog.error("MCC data validation failed: Dry weight is missing or invalid");
        throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Dry weight is missing or invalid");
      }

      if (replicate.containerAndDryWeight() == null
          || replicate.containerAndDryWeight().compareTo(BigDecimal.ZERO) < 0
          || replicate.containerAndDryWeight().compareTo(BigDecimal.valueOf(999.999)) > 0) {
        SparLog.error("MCC data validation failed: "
            + "Container and dry weight is missing or invalid");
        throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Container and dry weight is missing or invalid");
      }
    }
  }

  /**
   * This function validates Activity part of the data to be submitted for MCC.
   * Throws exception if validation fails.
   *
   * @param activityData activity entity to be validated
   * @throws ResponseStatusException if any validation fails
   */
  public void validateMoistureContentActivityData(ActivityEntity activityData) {
    SparLog.info("Validating MCC activity data");

    if (activityData.getTestCategoryCode() == null) {
      SparLog.error("MCC activity data validation failed: Test category code is missing");
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Test category code is missing");
    }
    if (activityData.getActualBeginDateTime() == null
        || activityData.getActualBeginDateTime().compareTo(LocalDateTime.now()) < 0) {
      SparLog.error("MCC activity data validation failed: "
          + "Actual begin date time is missing or in the past");
      throw new ResponseStatusException(
        HttpStatus.BAD_REQUEST,
        "Actual begin date time is missing or in the past");
    }
    if (activityData.getActualEndDateTime() == null
        || activityData.getActualEndDateTime().compareTo(LocalDateTime.now()) < 0) {
      SparLog.error("MCC activity data validation failed: "
          + "Actual end date time is missing or in the past");
      throw new ResponseStatusException(
        HttpStatus.BAD_REQUEST,
        "Actual end date time is missing or in the past");
    }
  }

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
   * @param riaKey the identifier key for all table related to MCC
   */
  public void acceptMoistureContentData(BigDecimal riaKey) {
    SparLog.info("Accepting moisture content data for RIA_SKEY: {}", riaKey);

    Optional<MoistureContentConesDto> moistureContent = getMoistureConeContentData(riaKey);

    if (moistureContent.isEmpty()) {
      SparLog.warn("No data found for RIA_SKEY: {}", riaKey);
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No data found for given RIA_KEY");
    }

    if (moistureContent.get().testCompleteInd() == 0) {
      SparLog.error("Test is not completed for RIA_SKEY: {}", riaKey);
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Test is not completed");
    }

    testResultRepository.updateTestResultStatusToAccepted(riaKey);
    SparLog.info("Moisture content data accepted for RIA_SKEY: {}", riaKey);
  }

  /**
   * Deletes a single replicate.
   *
   * @param riaKey          the identifier key for all table related to MCC
   * @param replicateNumber the replicate number to be deleted
   */
  public void deleteMccReplicate(@NonNull BigDecimal riaKey, @NonNull Integer replicateNumber) {
    SparLog.info("Deleting a replicate tables with the " + "riaKey: {} and replicateNumber: {}",
        riaKey, replicateNumber);

    Optional<ReplicateEntity> replicates =
        replicateRepository.findSingleReplicate(riaKey, replicateNumber);

    if (replicates.isEmpty()) {
      throw new InvalidMccKeyException();
    }

    replicateRepository.deleteByRiaKeyAndReplicateNumber(riaKey, replicateNumber);

    SparLog.info("Replicate {} with riaKey {} ", replicateNumber, riaKey + "deleted!");
  }

  /**
   * Deletes MCC data on multiple tables.
   *
   * @param riaKey the identifier key for all table related to MCC
   */
  @Transactional
  public void deleteFullMcc(@NonNull BigDecimal riaKey) {
    SparLog.info(
        "Deleting entries on Activity, Replicate and TestResult tables " + "with the riaKey: {}",
        riaKey);
    Optional<ActivityEntity> activityEntity = activityRepository.findById(riaKey);

    Optional<TestResultEntity> testEntity = testResultRepository.findById(riaKey);

    List<ReplicateEntity> replicates =
        replicateRepository.findByRiaKeyAndReplicateNumbers(riaKey, replicateIds);

    if (activityEntity.isEmpty() || testEntity.isEmpty() || replicates.isEmpty()) {
      throw new InvalidMccKeyException();
    }

    activityRepository.deleteById(riaKey);
    testResultRepository.deleteById(riaKey);

    replicates.forEach(rep -> replicateRepository.deleteByRiaKeyAndReplicateNumber(riaKey,
        rep.getId().getReplicateNumber()));

    SparLog.info("Activity, Replicate and TestResult with riaKey {} ", riaKey + "deleted!");
  }
}
