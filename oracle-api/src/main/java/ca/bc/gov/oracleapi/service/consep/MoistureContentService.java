package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.MccReplicateDto;
import ca.bc.gov.oracleapi.dto.consep.MccReplicateFormDto;
import ca.bc.gov.oracleapi.dto.consep.MoistureContentConesDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.entity.consep.MccReplicateEntity;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.entity.consep.idclass.ReplicateId;
import ca.bc.gov.oracleapi.exception.InvalidTestActivityKeyException;
import ca.bc.gov.oracleapi.repository.consep.ActivityRepository;
import ca.bc.gov.oracleapi.repository.consep.MccReplicatesRepository;
import ca.bc.gov.oracleapi.repository.consep.TestResultRepository;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
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

  private final MccReplicatesRepository replicateRepository;

  // The maximum number of replicates is 8 and the entries are sequencial,
  // so we can use a fixed list to fetch the data for the replicates.
  private final List<Integer> replicateIds =
      IntStream.rangeClosed(1, 8).boxed().collect(Collectors.toList());

  /**
   * Calculate the average of a list of numbers.
   *
   * @param numbers A list of numbers to calculate the average.
   * @return The calculated average.
   */
  public double calculateAverage(BigDecimal riaKey, List<Double> numbers) {
    if (numbers == null || numbers.isEmpty()) {
      throw new IllegalArgumentException("The list of numbers cannot be null or empty");
    }
    Double average = numbers.stream().mapToDouble(Double::doubleValue).average().orElse(0);
    testResultRepository.updateTestResultAvgValue(riaKey, average);
    return average;
  }

  /**
   * Get information for moisture cone content.
   */
  public Optional<MoistureContentConesDto> getMoistureConeContentData(BigDecimal riaKey) {
    SparLog.info("Begin to query necessary tables for moisture cone content");

    Optional<ActivityEntity> activityData = activityRepository.findById(riaKey);

    Optional<TestResultEntity> testResultData = testResultRepository.findById(riaKey);

    List<MccReplicateEntity> replicates =
        replicateRepository.findByRiaKeyAndReplicateNumbers(riaKey, replicateIds);

    if (activityData.isEmpty() || testResultData.isEmpty()) {
      SparLog.warn("No data found for RIA_SKEY: {}", riaKey);
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No data found for given RIA_SKEY");
    }

    List<MccReplicateDto> replicatesList = replicates.stream().map(
        (curReplicate) -> new MccReplicateDto(
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
   * Update replicate.
   *
   * @param riaKey the identifier key for all table related to MCC
   * @param replicateFormDtos an object with the values to be updated
   */
  @Transactional
  public List<MccReplicateEntity> updateReplicateField(
      @NonNull BigDecimal riaKey,
      @NonNull List<MccReplicateFormDto> replicateFormDtos
  ) {
    SparLog.info("Updating replicates with the riaKey: {}", riaKey);

    List<Integer> replicateNumbers = replicateFormDtos.stream()
        .map(MccReplicateFormDto::replicateNumber)
        .collect(Collectors.toList());

    List<MccReplicateEntity> existingReplicates =
        replicateRepository.findByRiaKeyAndReplicateNumbers(riaKey, replicateNumbers);

    Map<Integer, MccReplicateEntity> replicateMap = existingReplicates.stream()
        .collect(Collectors.toMap(rep -> rep.getId().getReplicateNumber(), Function.identity()));

    List<MccReplicateEntity> updatedReplicates = new ArrayList<>();

    for (MccReplicateFormDto dto : replicateFormDtos) {
      int replicateNumber = dto.replicateNumber();

      MccReplicateEntity repEntity = replicateMap.getOrDefault(
          replicateNumber, new MccReplicateEntity());
      if (repEntity.getId() == null) {
        repEntity.setId(new ReplicateId(riaKey, replicateNumber));
        SparLog.info("Replicate number {} not found for riaKey {}. Creating new replicate.",
            replicateNumber, riaKey);
      }

      repEntity.setContainerId(dto.containerId());
      repEntity.setContainerWeight(dto.containerWeight());
      repEntity.setFreshSeed(dto.freshSeed());
      repEntity.setContainerAndDryWeight(dto.containerAndDryWeight());
      repEntity.setDryWeight(dto.dryWeight());
      repEntity.setReplicateAccInd(dto.replicateAccInd());
      repEntity.setReplicateComment(dto.replicateComment());
      repEntity.setOverrideReason(dto.overrideReason());

      updatedReplicates.add(repEntity);
    }

    List<MccReplicateEntity> savedReplicates = replicateRepository.saveAll(updatedReplicates);
    SparLog.info("Updated {} replicates for riaKey: {}", savedReplicates.size(), riaKey);

    return savedReplicates;
  }

  /**
   * This function validates the data to be submitted for MCC.
   * Throws exception if validation fails
   *
   * @param moistureContentConesDataDtos a list of replicates to validate
   * @throws ResponseStatusException if any validation fails
   */
  public void validateMoistureConeContentData(List<MccReplicateDto> moistureContentConesDataDtos) {
    SparLog.info("Validating MCC data");
    // Validate the data
    for (MccReplicateDto replicate : moistureContentConesDataDtos) {

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
   * Deletes multiple replicates.
   *
   * @param riaKey          the identifier key for all table related to MCC
   * @param replicateNumbers the replicate numbers to be deleted
   */
  @Transactional
  public void deleteMccReplicates(
      @NonNull BigDecimal riaKey,
      @NonNull List<Integer> replicateNumbers
  ) {
    SparLog.info("Deleting replicates with the riaKey: {} and replicateNumbers: {}",
        riaKey, replicateNumbers);

    List<MccReplicateEntity> replicates = replicateRepository.findByRiaKeyAndReplicateNumbers(
        riaKey,
        replicateNumbers
    );

    if (replicates.isEmpty()) {
      throw new InvalidTestActivityKeyException();
    }

    replicateRepository.deleteByRiaKeyAndReplicateNumbers(riaKey, replicateNumbers);

    SparLog.info("Replicates with riaKey {} ", riaKey + "deleted!");
  }

  /**
   * Deletes a single replicate.
   *
   * @param riaKey          the identifier key for all table related to MCC
   * @param replicateNumber the replicate number to be deleted
   */
  @Transactional
  public void deleteMccReplicate(
      @NonNull BigDecimal riaKey,
      @NonNull Integer replicateNumber
  ) {
    SparLog.info("Deleting a replicate tables with the "
        + "riaKey: {} and replicateNumber: {}", riaKey, replicateNumber);

    Optional<MccReplicateEntity> replicates = replicateRepository.findSingleReplicate(
        riaKey,
        replicateNumber
    );

    if (replicates.isEmpty()) {
      throw new InvalidTestActivityKeyException();
    }

    replicateRepository.deleteByRiaKeyAndReplicateNumber(riaKey, replicateNumber);
    replicateRepository.reorderTestReplicateNumbers(riaKey);

    SparLog.info("Replicate {} with riaKey {} ", replicateNumber, riaKey + "deleted!");
  }
}
