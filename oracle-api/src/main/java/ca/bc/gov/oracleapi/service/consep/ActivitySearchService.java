package ca.bc.gov.oracleapi.service.consep;

import ca.bc.gov.oracleapi.dto.consep.ActivitySearchResponseDto;
import ca.bc.gov.oracleapi.entity.consep.ActivitySearchResultEntity;
import ca.bc.gov.oracleapi.mapper.ActivitySearchMapper;
import ca.bc.gov.oracleapi.repository.consep.ActivitySearchRepository;
import ca.bc.gov.oracleapi.search.PageResponse;
import ca.bc.gov.oracleapi.search.SearchRequest;
import ca.bc.gov.oracleapi.search.SearchSchema;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Standard paginated search over CONSEP testing activities (the CNS17 view). */
@Service
@RequiredArgsConstructor
public class ActivitySearchService {

  private final ActivitySearchRepository activitySearchRepository;
  private final ActivitySearchMapper activitySearchMapper;
  private final SearchSchema<ActivitySearchResultEntity> schema;

  /**
   * Runs a search.
   *
   * @param request filter, sort and paging
   * @return one page of results
   */
  @Transactional(readOnly = true)
  public PageResponse<ActivitySearchResponseDto> search(SearchRequest request) {
    return PageResponse.from(
        schema.find(activitySearchRepository, request).map(activitySearchMapper::toDto));
  }

  /**
   * Returns the given lot numbers that have no testing activities, compared case-insensitively.
   *
   * @param lotNumbers lot numbers to check
   * @return the ones not found, upper-cased, in request order
   */
  @Transactional(readOnly = true)
  public List<String> findMissingLotNumbers(Collection<String> lotNumbers) {
    Set<String> requested =
        lotNumbers.stream()
            .filter(lot -> lot != null && !lot.isBlank())
            .map(lot -> lot.trim().toUpperCase(Locale.ROOT))
            .collect(Collectors.toCollection(LinkedHashSet::new));
    if (requested.isEmpty()) {
      return List.of();
    }
    Set<String> found = activitySearchRepository.findExistingLotNumbers(requested);
    return requested.stream().filter(lot -> !found.contains(lot)).toList();
  }
}
