package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.dto.consep.ActivitySearchRequestDto;
import ca.bc.gov.oracleapi.dto.consep.ActivitySearchResponseDto;
import ca.bc.gov.oracleapi.entity.consep.ActivitySearchResultEntity;
import ca.bc.gov.oracleapi.repository.consep.ActivitySearchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;
import java.util.stream.Collectors;


import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivitySearchService {

  private final ActivitySearchRepository activitySearchRepository;

  public List<ActivitySearchResponseDto> searchActivities(ActivitySearchRequestDto activitySearchRequestDto, Pageable pageable) {
    int offset = (int) pageable.getOffset();
    int size = pageable.getPageSize();

    // Convert List to a Comma-Separated String if there are lot numbers, so native query can support the IN operation
    String lotNumbersStr = activitySearchRequestDto.lotNumbers() != null
      ? String.join(",", activitySearchRequestDto.lotNumbers())
      : null;

    List<ActivitySearchResultEntity> results = activitySearchRepository.searchActivities(
      lotNumbersStr,
      activitySearchRequestDto.testType(),
      activitySearchRequestDto.activityId(),
      activitySearchRequestDto.germinatorTrayId(),
      activitySearchRequestDto.seedWithdrawalStartDate(),
      activitySearchRequestDto.seedWithdrawalEndDate(),
      activitySearchRequestDto.includeHistoricalTests(),
      activitySearchRequestDto.germTestsOnly(),
      activitySearchRequestDto.requestId(),
      activitySearchRequestDto.requestType(),
      activitySearchRequestDto.requestYear(),
      activitySearchRequestDto.orchardId(),
      activitySearchRequestDto.testCategoryCd(),
      activitySearchRequestDto.testRank(),
      activitySearchRequestDto.species(),
      activitySearchRequestDto.actualBeginDateFrom(),
      activitySearchRequestDto.actualBeginDateTo(),
      activitySearchRequestDto.actualEndDateFrom(),
      activitySearchRequestDto.actualEndDateTo(),
      activitySearchRequestDto.revisedStartDateFrom(),
      activitySearchRequestDto.revisedStartDateTo(),
      activitySearchRequestDto.revisedEndDateFrom(),
      activitySearchRequestDto.revisedEndDateTo(),
      activitySearchRequestDto.germTrayAssignment(),
      activitySearchRequestDto.completeStatus(),
      activitySearchRequestDto.acceptanceStatus(),
      activitySearchRequestDto.seedlotClass(),
      offset,
      size
    );

    return results.stream()
      .map(this::toDto)
      .toList();
  }


  private ActivitySearchResponseDto toDto(ActivitySearchResultEntity activitySearchResultEntity) {
    return new ActivitySearchResponseDto(
      activitySearchResultEntity.getSeedlotDisplay(),
      activitySearchResultEntity.getRequestItem(),
      activitySearchResultEntity.getSpecies(),
      activitySearchResultEntity.getActivityId(),
      activitySearchResultEntity.getTestRank(),
      activitySearchResultEntity.getCurrentTestInd(),
      activitySearchResultEntity.getTestCategoryCd(),
      activitySearchResultEntity.getGerminationPct(),
      activitySearchResultEntity.getPv(),
      activitySearchResultEntity.getMoisturePct(),
      activitySearchResultEntity.getPurityPct(),
      activitySearchResultEntity.getSeedsPerGram(),
      activitySearchResultEntity.getOtherTestResult(),
      activitySearchResultEntity.getTestCompleteInd(),
      activitySearchResultEntity.getAcceptResultInd(),
      activitySearchResultEntity.getSignificntStsInd(),
      activitySearchResultEntity.getSeedWithdrawalDate(),
      activitySearchResultEntity.getRevisedEndDt(),
      activitySearchResultEntity.getActualBeginDtTm(),
      activitySearchResultEntity.getActualEndDtTm(),
      activitySearchResultEntity.getRiaComment(),
      activitySearchResultEntity.getRequestSkey(),
      activitySearchResultEntity.getReqId(),
      activitySearchResultEntity.getItemId(),
      activitySearchResultEntity.getSeedlotSample(),
      activitySearchResultEntity.getRiaSkey()
    );
  }
}
