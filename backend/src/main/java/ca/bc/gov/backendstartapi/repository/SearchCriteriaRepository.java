package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.SearchCriteriaEntity;
import ca.bc.gov.backendstartapi.entity.idclass.SearchCriteriaId;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** Repository for {@link SearchCriteriaEntity}. */
public interface SearchCriteriaRepository
    extends JpaRepository<SearchCriteriaEntity, SearchCriteriaId> {

  Optional<SearchCriteriaEntity> findByUserIdAndPageId(String userId, String pageId);
}
