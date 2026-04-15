package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.entity.SearchCriteriaEntity;
import ca.bc.gov.backendstartapi.repository.SearchCriteriaRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import java.util.Optional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

/** Service for managing saved search criteria per user and page. */
@Service
public class SearchCriteriaService {

  private final SearchCriteriaRepository searchCriteriaRepository;
  private final LoggedUserService loggedUserService;
  private final EntityManager entityManager;

  public SearchCriteriaService(
      SearchCriteriaRepository searchCriteriaRepository,
      LoggedUserService loggedUserService,
      EntityManager entityManager) {
    this.searchCriteriaRepository = searchCriteriaRepository;
    this.loggedUserService = loggedUserService;
    this.entityManager = entityManager;
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

    int updatedRows = updateCriteriaJson(userId, pageId, criteriaJson);
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
      SearchCriteriaEntity savedEntity = searchCriteriaRepository.save(entity);
      entityManager.flush();
      SparLog.info("Inserted new search criteria for user {} page {}", userId, pageId);
      return savedEntity;
    } catch (DataIntegrityViolationException ex) {
      SparLog.info(
          "Concurrent insert detected for user {} page {}; retrying update", userId, pageId);
      updateCriteriaJson(userId, pageId, criteriaJson);
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

  private int updateCriteriaJson(String userId, String pageId, String criteriaJson) {
    return entityManager
        .createQuery(
            "update SearchCriteriaEntity s "
                + "set s.criteriaJson = :criteriaJson "
                + "where s.userId = :userId and s.pageId = :pageId")
        .setParameter("criteriaJson", criteriaJson)
        .setParameter("userId", userId)
        .setParameter("pageId", pageId)
        .executeUpdate();
  }
}
