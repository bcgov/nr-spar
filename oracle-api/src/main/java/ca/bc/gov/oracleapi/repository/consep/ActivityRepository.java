package ca.bc.gov.oracleapi.repository.consep;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import java.math.BigDecimal;
import java.util.Optional;

/**
 * This interface enables the activity entity from consep to be retrieved from the database.
 */
public interface ActivityRepository extends JpaRepository<ActivityEntity, BigDecimal> {

  @Query("SELECT a.testCategoryCode, a.riaComment, a.actualEndDateTime, a.actualBeginDateTime " +
          "FROM ActivityEntity a WHERE a.riaSkey = :riaKey")
  Optional<ActivityEntity> findMccColumnsByRiaKey(@Param("riaKey") BigDecimal riaKey);
}
