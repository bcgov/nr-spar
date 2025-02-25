package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.dto.consep.MoistureContentConesDto;
import ca.bc.gov.oracleapi.dto.consep.ReplicateDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.entity.consep.ReplicateEntity;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.repository.consep.ActivityRepository;
import ca.bc.gov.oracleapi.repository.consep.ReplicateRepository;
import ca.bc.gov.oracleapi.repository.consep.TestResultRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** The class for Moisture Content Cones Service. */
@Service
@RequiredArgsConstructor
public class MoistureContentService {

  private final ActivityRepository activityRepository;

  private final TestResultRepository testResultRepository;

  private final ReplicateRepository replicateRepository;

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

    // The maximum number of replicates is 8 and the entries are sequencial,
    // so we can use a fixed list to fetch the data for the replicates.
    List<Integer> replicateIds = IntStream.rangeClosed(1, 8)
                                      .boxed()
                                      .collect(Collectors.toList());


    List<ReplicateEntity> replicates = replicateRepository.findByRiaKeyAndReplicateNumbers(
        riaKey,
        replicateIds
    );

    if (activityData.isEmpty() || testResultData.isEmpty() || replicates.isEmpty()) {
        SparLog.warn("No data found for RIA_SKEY: {}", riaKey);
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No data found for the given RIA_SKEY.");
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
}
