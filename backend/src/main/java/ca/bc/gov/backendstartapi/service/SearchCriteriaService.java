package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.entity.SearchCriteriaEntity;
import ca.bc.gov.backendstartapi.repository.SearchCriteriaRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.transaction.Transactional;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.dao.DataIntegrityViolationException;
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
   * @param criteriaJson the criteria as JSON (object or array)
   * @return the persisted entity
   */
  @Transactional
  public SearchCriteriaEntity setCriteria(String pageId, JsonNode criteriaJson) {
    String userId = loggedUserService.getLoggedUserId();
    SparLog.info("Setting search criteria for user {} page {}", userId, pageId);

    LocalDateTime now = LocalDateTime.now(Clock.systemUTC());
    int updatedRows =
        searchCriteriaRepository.updateCriteriaJsonByUserIdAndPageId(
            userId, pageId, criteriaJson, now);
    if (updatedRows > 0) {
      SparLog.info("Updated existing search criteria for user {} page {}", userId, pageId);
      return searchCriteriaRepository
          .findByUserIdAndPageId(userId, pageId)
          .orElseThrow(
              () ->
                  new IllegalStateException(
                      "Search criteria update succeeded but no entity was found for user "
                          + userId
                          + " page "
                          + pageId));
    }

    SearchCriteriaEntity entity = new SearchCriteriaEntity(userId, pageId, criteriaJson);
    try {
      SearchCriteriaEntity savedEntity = searchCriteriaRepository.saveAndFlush(entity);
      SparLog.info("Inserted new search criteria for user {} page {}", userId, pageId);
      return savedEntity;
    } catch (DataIntegrityViolationException ex) {
      SparLog.info(
          "Concurrent insert detected for user {} page {}; retrying update", userId, pageId);
      searchCriteriaRepository.updateCriteriaJsonByUserIdAndPageId(
          userId, pageId, criteriaJson, LocalDateTime.now(Clock.systemUTC()));
      return searchCriteriaRepository
          .findByUserIdAndPageId(userId, pageId)
          .orElseThrow(
              () ->
                  new IllegalStateException(
                      "Search criteria insert retry failed for user "
                          + userId
                          + " page "
                          + pageId,
                      ex));
    }
  }

}
