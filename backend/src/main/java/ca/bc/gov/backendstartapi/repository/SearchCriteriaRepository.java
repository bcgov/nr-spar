package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.SearchCriteriaEntity;
import ca.bc.gov.backendstartapi.entity.idclass.SearchCriteriaId;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

/** Repository for {@link SearchCriteriaEntity}. */
public interface SearchCriteriaRepository
    extends JpaRepository<SearchCriteriaEntity, SearchCriteriaId> {

  Optional<SearchCriteriaEntity> findByUserIdAndPageId(String userId, String pageId);

  @Modifying(clearAutomatically = true)
  @Query(
      "update SearchCriteriaEntity sc "
          + "set sc.criteriaJson = ?3, sc.updateTimestamp = ?4, "
          + "sc.revisionCount = sc.revisionCount + 1 "
          + "where sc.userId = ?1 and sc.pageId = ?2")
  int updateCriteriaJsonByUserIdAndPageId(
      String userId, String pageId, JsonNode criteriaJson, LocalDateTime updateTimestamp);
}
