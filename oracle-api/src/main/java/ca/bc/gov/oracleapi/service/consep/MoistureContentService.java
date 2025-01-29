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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MoistureContentService {

  private final ActivityRepository activityRepository;

  private final TestResultRepository testResultRepository;

  private final ReplicateRepository replicateRepository;

  /**
   * Get information for moisture cone content
   */
  public Optional<MoistureContentConesDto> getMoistureConeContentData(
    BigDecimal riaKey,
    List<Integer> replicateIds
  ) {
    SparLog.info("Begin to query necessary tables for moisture cone content");

    Optional<ActivityEntity> activityData = activityRepository.findMccColumnsByRiaKey(riaKey);

    Optional<TestResultEntity> testResultData = testResultRepository.findSelectedColumnsByRiaKey(riaKey);

    List<ReplicateDto> replicatesList = new ArrayList<>();

    replicateIds.forEach((id) -> {
      Optional<ReplicateEntity> curReplicate = replicateRepository.findByRiaKeyAndReplicateNumber(riaKey, id);
      ReplicateDto replicateToAdd = new ReplicateDto(
          riaKey,
          id,
          curReplicate.get().getContainerId(),
          curReplicate.get().getContainerWeight(),
          curReplicate.get().getFreshSeed(),
          curReplicate.get().getContainerAndDryWeight(),
          curReplicate.get().getDryWeight(),
          curReplicate.get().getReplicateAccInd(),
          curReplicate.get().getReplicateComment(),
          curReplicate.get().getOverrideReason()
      );
      replicatesList.add(replicateToAdd);
    });

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
}
