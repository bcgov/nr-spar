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
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
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
  private final List<Integer> replicateIds = IntStream.rangeClosed(1, 8)
                                            .boxed()
                                            .collect(Collectors.toList());


  /**
   * Get information for moisture cone content.
   */
  public Optional<MoistureContentConesDto> getMoistureConeContentData(
      BigDecimal riaKey
  ) {
    SparLog.info("Begin to query necessary tables for moisture cone content");

    Optional<ActivityEntity> activityData = activityRepository.findById(riaKey);

    Optional<TestResultEntity> testResultData = testResultRepository.findById(
        riaKey
    );

    List<ReplicateEntity> replicates = replicateRepository.findByRiaKeyAndReplicateNumbers(
        riaKey,
        replicateIds
    );

    if (activityData.isEmpty() || testResultData.isEmpty() || replicates.isEmpty()) {
      SparLog.warn("No data found for RIA_SKEY: {}", riaKey);
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No data found for given RIA_SKEY");
    }

    List<ReplicateDto> replicatesList = replicates
        .stream()
        .map((curReplicate) -> new ReplicateDto(
            curReplicate.getId().getRiaKey(),
            curReplicate.getId().getReplicateNumber(),
            curReplicate.getContainerId(),
            curReplicate.getContainerWeight(),
            curReplicate.getFreshSeed(),
            curReplicate.getContainerAndDryWeight(),
            curReplicate.getDryWeight(),
            curReplicate.getReplicateAccInd(),
            curReplicate.getReplicateComment(),
            curReplicate.getOverrideReason()
        ))
        .collect(Collectors.toList());

    MoistureContentConesDto moistureContent = new MoistureContentConesDto(
        testResultData.get().getTestCompleteInd(),
        testResultData.get().getSampleDesc(),
        testResultData.get().getMoistureStatus(),
        testResultData.get().getMoisturePct(),
        testResultData.get().getAcceptResult(),
        activityData.get().getTestCategoryCode(),
        activityData.get().getRiaComment(),
        activityData.get().getActualBeginDateTime(),
        activityData.get().getActualEndDateTime(),
        replicatesList
    );
    SparLog.info("MCC data correctly fetched");
    return Optional.of(moistureContent);
  }

  private static final Set<String> ALLOWED_REPLICATE_FIELDS = Set.of(
      "containerId", "containerWeight", "freshSeed", "containerAndDryWeight",
      "dryWeight", "replicateAccInd", "replicateComment", "overrideReason"
  );

  /**
   * Update a single replicate.
   *
   * @param riaKey the identifier key for all table related to MCC
   * @param replicateNumber the replicate number to be updated
   * @param updates a map with the fields and the values to be updated
   */
  public void updateReplicateField(
      @NonNull BigDecimal riaKey,
      @NonNull Integer replicateNumber,
      Map<String, Object> updates
  ) {
    SparLog.info("Updating a replicate with the "
        + "riaKey: {} and replicateNumber: {}", riaKey, replicateNumber);
    if (updates.isEmpty()) {
      SparLog.info("Empty object for fields to update");
      throw new IllegalArgumentException("No fields provided for update.");
    }

    for (Map.Entry<String, Object> entry : updates.entrySet()) {
      String field = entry.getKey();
      Object value = entry.getValue();

      if (!ALLOWED_REPLICATE_FIELDS.contains(field)) {
        throw new IllegalArgumentException("Invalid field: " + field);
      }
      replicateRepository.updateField(riaKey, replicateNumber, field, value);
    }
    SparLog.info("Replicate riaKey: {} and replicateNumber: {} updated", riaKey, replicateNumber);
  }

  private static final Set<String> ALLOWED_ACTIVITY_FIELDS = Set.of(
      "testCategoryCode", "riaComment", "actualBeginDateTime", "actualEndDateTime"
  );

  /**
   * Update activity table.
   *
   * @param riaKey the identifier key for all table related to MCC
   * @param updates a map with the fields and the values to be updated
   */
  public void updateActivityField(
      @NonNull BigDecimal riaKey,
      Map<String, Object> updates
  ) {
    SparLog.info("Updating a activity with the riaKey: {}", riaKey);

    if (updates.isEmpty()) {
      throw new IllegalArgumentException("No fields provided for update.");
    }

    for (Map.Entry<String, Object> entry : updates.entrySet()) {
      String field = entry.getKey();
      Object value = entry.getValue();

      if (!ALLOWED_ACTIVITY_FIELDS.contains(field)) {
        throw new IllegalArgumentException("Invalid field: " + field);
      }
      activityRepository.updateField(riaKey, field, value);
    }
    SparLog.info("Activity riaKey: {} updated", riaKey);
  }

  /**
   * Deletes a single replicate.
   *
   * @param riaKey the identifier key for all table related to MCC
   * @param replicateNumber the replicate number to be deleted
   */
  public void deleteMccReplicate(
      @NonNull BigDecimal riaKey,
      @NonNull Integer replicateNumber
  ) {
    SparLog.info("Deleting a replicate tables with the "
        + "riaKey: {} and replicateNumber: {}", riaKey, replicateNumber);

    Optional<ReplicateEntity> replicates = replicateRepository.findSingleReplicate(
        riaKey,
        replicateNumber
    );

    if (replicates.isEmpty()) {
      throw new InvalidMccKeyException();
    }

    replicateRepository.deleteByRiaKeyAndReplicateNumber(riaKey, replicateNumber);

    SparLog.info("Replicate {} with riaKey {} ", replicateNumber, riaKey
            + "deleted!");
  }

  /**
   * Deletes MCC data on multiple tables.
   *
   * @param riaKey the identifier key for all table related to MCC
   */
  @Transactional
  public void deleteFullMcc(@NonNull BigDecimal riaKey) {
    SparLog.info("Deleting entries on Activity, Replicate and TestResult tables "
            + "with the riaKey: {}", riaKey);
    Optional<ActivityEntity> activityEntity = activityRepository.findById(riaKey);

    Optional<TestResultEntity> testEntity = testResultRepository.findById(riaKey);

    List<ReplicateEntity> replicates = replicateRepository.findByRiaKeyAndReplicateNumbers(
        riaKey,
        replicateIds
    );

    if (activityEntity.isEmpty()
        || testEntity.isEmpty()
        || replicates.isEmpty()
    ) {
      throw new InvalidMccKeyException();
    }

    activityRepository.deleteById(riaKey);
    testResultRepository.deleteById(riaKey);

    replicates.forEach(
        rep -> replicateRepository.deleteByRiaKeyAndReplicateNumber(
          riaKey,
          rep.getId().getReplicateNumber()
        )
    );

    SparLog.info("Activity, Replicate and TestResult with riaKey {} ", riaKey
            + "deleted!");
  }
}
