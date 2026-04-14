package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.entity.SearchCriteriaEntity;
import ca.bc.gov.backendstartapi.repository.SearchCriteriaRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import jakarta.transaction.Transactional;
import java.util.Optional;
import org.springframework.stereotype.Service;

/** Service for managing saved search criteria per user and page. */
@Service
public class SearchCriteriaService {

  private final SearchCriteriaRepository searchCriteriaRepository;
  private final LoggedUserService loggedUserService;

  public SearchCriteriaService(
      SearchCriteriaRepository searchCriteriaRepository, LoggedUserService loggedUserService) {
    this.searchCriteriaRepository = searchCriteriaRepository;
    this.loggedUserService = loggedUserService;
  }

  /**
   * Returns the saved criteria JSON for the logged-in user and given page.
   *
   * @param pageId the page identifier
   * @return an Optional containing the entity if found
   */
  public Optional<SearchCriteriaEntity> getCriteria(String pageId) {
    String userId = loggedUserService.getLoggedUserId();
    SparLog.info("Getting search criteria for user {} page {}", userId, pageId);
    return searchCriteriaRepository.findByUserIdAndPageId(userId, pageId);
  }

  /**
   * Upserts search criteria: tries update first, inserts if no row exists. Per the spec, always
   * attempt update first for best performance.
   *
   * @param pageId the page identifier
   * @param criteriaJson the criteria as a JSON string
   * @return the persisted entity
   */
  @Transactional
  public SearchCriteriaEntity setCriteria(String pageId, String criteriaJson) {
    String userId = loggedUserService.getLoggedUserId();
    SparLog.info("Setting search criteria for user {} page {}", userId, pageId);

    Optional<SearchCriteriaEntity> existing =
        searchCriteriaRepository.findByUserIdAndPageId(userId, pageId);

    if (existing.isPresent()) {
      SearchCriteriaEntity entity = existing.get();
      entity.setCriteriaJson(criteriaJson);
      SparLog.info("Updated existing search criteria for user {} page {}", userId, pageId);
      return searchCriteriaRepository.save(entity);
    }

    SearchCriteriaEntity entity = new SearchCriteriaEntity(userId, pageId, criteriaJson);
    SparLog.info("Inserted new search criteria for user {} page {}", userId, pageId);
    return searchCriteriaRepository.save(entity);
  }
}
