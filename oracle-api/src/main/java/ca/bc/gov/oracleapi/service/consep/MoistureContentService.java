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
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

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

    Optional<ActivityEntity> activityData = activityRepository.findMccColumnsByRiaKey(riaKey);

    Optional<TestResultEntity> testResultData = testResultRepository.findSelectedColumnsByRiaKey(
        riaKey
    );

    List<ReplicateEntity> replicates = replicateRepository.findByRiaKeyAndReplicateNumbers(
        riaKey,
        replicateIds
    );

    List<ReplicateDto> replicatesList = replicates
        .stream()
        .map((curReplicate) -> new ReplicateDto(
            curReplicate.getRiaKey(),
            curReplicate.getReplicateNumber(),
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

    if (
        activityData.isPresent()
        || testResultData.isPresent()
        || !(replicatesList.isEmpty())
    ) {
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

    SparLog.info("An error occured when fetching data from the database");
    return Optional.empty();
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
    replicateRepository.deleteById(riaKey);

    SparLog.info("Activity, Replicate and TestResult with riaKey {} ", riaKey
            + "deleted!");
  }
}
