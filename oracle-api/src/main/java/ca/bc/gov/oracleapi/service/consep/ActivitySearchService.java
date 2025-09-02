package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.dto.consep.ActivitySearchRequestDto;
import ca.bc.gov.oracleapi.dto.consep.ActivitySearchResponseDto;
import ca.bc.gov.oracleapi.entity.consep.ActivitySearchResultEntity;
import ca.bc.gov.oracleapi.repository.consep.ActivitySearchRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/**
 * Service class responsible for handling searching for testing
 * activities in CONSEP.
 * This service delegates the actual database queries to the {@link ActivitySearchRepository},
 * formats parameters as needed, and converts results to DTOs to be returned to the API consumer.
 */
@Service
@RequiredArgsConstructor
public class ActivitySearchService {

  private final ActivitySearchRepository activitySearchRepository;

  /**
   * Searches for testing activities based on the provided filter criteria and pagination options.
   * The method transforms the list of lot numbers into a comma-separated string so it can be used
   * in native SQL `IN` clauses, passes all filter fields to the repository, and converts the
   * resulting entities into response DTOs.
   *
   * @param activitySearchRequestDto The DTO containing all filter criteria for the search.
   * @param pageable                 Pagination information (page number and size).
   * @return A list of {@link ActivitySearchResponseDto} representing the test activities.
   */
  public List<ActivitySearchResponseDto> searchActivities(
      ActivitySearchRequestDto activitySearchRequestDto,
      Pageable pageable) {
    int offset = (int) pageable.getOffset();
    int size = pageable.getPageSize();

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

  /**
   * Converts an {@link ActivitySearchResultEntity} object into a corresponding
   * {@link ActivitySearchResponseDto} object.
   *
   * @param activitySearchResultEntity The entity object returned from the repository.
   * @return The converted {@link ActivitySearchResponseDto} to be returned to the API layer.
   */
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
