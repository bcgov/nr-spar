package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.ActivitySearchResultEntity;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Read access to the CNS17 testing activity search view. */
public interface ActivitySearchRepository
    extends JpaRepository<ActivitySearchResultEntity, Integer>,
        JpaSpecificationExecutor<ActivitySearchResultEntity> {

  @Query("""
      select distinct upper(a.seedlotDisplay)
      from ActivitySearchResultEntity a
      where upper(a.seedlotDisplay) in :lotNumbers
      """)
  Set<String> findExistingLotNumbers(@Param("lotNumbers") Set<String> lotNumbers);
}
