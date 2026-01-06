package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.dto.consep.ActivitySearchPageResponseDto;
import ca.bc.gov.oracleapi.dto.consep.ActivitySearchRequestDto;
import ca.bc.gov.oracleapi.dto.consep.ActivitySearchResponseDto;
import ca.bc.gov.oracleapi.entity.consep.ActivitySearchResultEntity;
import ca.bc.gov.oracleapi.repository.consep.ActivitySearchRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
   * The repository handles pagination via {@link Pageable}.
   *
   * @param activitySearchRequestDto The DTO containing all filter criteria for the search.
   * @param pageable                 Pagination information (page number and size).
   * @return A paginated response containing {@link ActivitySearchResponseDto} and total count.
   */
  public ActivitySearchPageResponseDto searchTestingActivities(
      ActivitySearchRequestDto activitySearchRequestDto,
      Pageable pageable,
      String sortBy,
      String sortDirection) {

    Sort sort = Sort.by("seedlotSample").ascending().and(Sort.by("actualBeginDtTm").ascending());

    if (sortBy != null && !sortBy.isBlank()) {
      sort = Sort.by("desc".equalsIgnoreCase(sortDirection)
          ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
    }
    if (pageable.isPaged()) {
      pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
    } else {
      pageable = Pageable.unpaged(sort);
    }

    LocalDateTime seedWithdrawalStartDate =
        toStartOfDay(activitySearchRequestDto.seedWithdrawalStartDate());
    LocalDateTime seedWithdrawalEndDate =
        toEndOfDay(activitySearchRequestDto.seedWithdrawalEndDate());
    LocalDateTime actualBeginFrom = toStartOfDay(activitySearchRequestDto.actualBeginDateFrom());
    LocalDateTime actualBeginTo = toEndOfDay(activitySearchRequestDto.actualBeginDateTo());
    LocalDateTime actualEndFrom = toStartOfDay(activitySearchRequestDto.actualEndDateFrom());
    LocalDateTime actualEndTo = toEndOfDay(activitySearchRequestDto.actualEndDateTo());
    LocalDateTime revisedStartDateFrom =
        toStartOfDay(activitySearchRequestDto.revisedStartDateFrom());
    LocalDateTime revisedStartDateTo = toEndOfDay(activitySearchRequestDto.revisedStartDateTo());
    LocalDateTime revisedEndDateFrom = toStartOfDay(activitySearchRequestDto.revisedEndDateFrom());
    LocalDateTime revisedEndDateTo = toEndOfDay(activitySearchRequestDto.revisedEndDateTo());
    List<String> upperLotNumbers = null;
    Set<String> requestedLotSet = null;
    if (activitySearchRequestDto.lotNumbers() != null
        && !activitySearchRequestDto.lotNumbers().isEmpty()) {
      upperLotNumbers = activitySearchRequestDto.lotNumbers()
          .stream()
          .map(String::toUpperCase)
          .toList();
      requestedLotSet = Set.copyOf(upperLotNumbers);
    }

    // Fetch paginated results from repository
    Page<ActivitySearchResultEntity> results = activitySearchRepository.searchTestingActivities(
        upperLotNumbers,
        activitySearchRequestDto.testType(),
        activitySearchRequestDto.activityId(),
        activitySearchRequestDto.germinatorTrayId(),
        seedWithdrawalStartDate,
        seedWithdrawalEndDate,
        activitySearchRequestDto.includeHistoricalTests(),
        activitySearchRequestDto.germTestsOnly(),
        activitySearchRequestDto.requestId(),
        activitySearchRequestDto.requestType(),
        activitySearchRequestDto.requestYear(),
        activitySearchRequestDto.orchardId(),
        activitySearchRequestDto.testCategoryCd(),
        activitySearchRequestDto.testRank(),
        activitySearchRequestDto.species(),
        actualBeginFrom,
        actualBeginTo,
        actualEndFrom,
        actualEndTo,
        revisedStartDateFrom,
        revisedStartDateTo,
        revisedEndDateFrom,
        revisedEndDateTo,
        activitySearchRequestDto.germTrayAssignment(),
        activitySearchRequestDto.completeStatus(),
        activitySearchRequestDto.acceptanceStatus(),
        activitySearchRequestDto.geneticClassCode(),
        activitySearchRequestDto.familyLotsOnly(),
        pageable
    );

    // Map entities to DTOs
    Page<ActivitySearchResponseDto> dtoPage = results.map(this::toDto);

    List<String> missingLotNumbers = List.of();
    if (requestedLotSet != null) {
      Set<String> foundLotNumbers =
          results.getContent().stream()
              .map(ActivitySearchResultEntity::getSeedlotDisplay)
              .filter(s -> s != null && !((String) s).trim().isEmpty())
              .map(s -> ((String) s).toUpperCase())
              .collect(java.util.stream.Collectors.toSet());

      missingLotNumbers = requestedLotSet.stream()
          .filter(lot -> !foundLotNumbers.contains(lot))
          .toList();
    }


    // Wrap into paginated response
    return new ActivitySearchPageResponseDto(
        dtoPage.getContent(),
        dtoPage.getTotalElements(),
        dtoPage.getTotalPages(),
        dtoPage.getNumber(),
        dtoPage.getSize(),
        missingLotNumbers
    );
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
        activitySearchResultEntity.getRiaSkey(),
        activitySearchResultEntity.getActivityTypeCd()
    );
  }

  /**
   * Converts a given {@link LocalDate} to the start of the day (00:00:00). May be {@code null}.
   *
   * @param date The {@link LocalDate} to convert
   * @return The corresponding {@link LocalDateTime} at the start of the given day,
   *         or {@code null} if the input date is {@code null}.
   */
  private LocalDateTime toStartOfDay(LocalDate date) {
    return date != null ? date.atStartOfDay() : null;
  }

  /**
   * Converts a given {@link LocalDate} to the end of the day (23:59:59.999999999).
   * May be {@code null}.
   *
   * @param date The {@link LocalDate} to convert
   * @return The corresponding {@link LocalDateTime} at the end of the given day,
   *         or {@code null} if the input date is {@code null}.
   */
  private LocalDateTime toEndOfDay(LocalDate date) {
    return date != null ? date.atTime(LocalTime.MAX) : null;
  }
}
