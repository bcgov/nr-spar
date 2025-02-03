package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import java.math.BigDecimal;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/**
 * This interface enables the activity entity from consep to be retrieved from the database.
 */
public interface ActivityRepository extends JpaRepository<ActivityEntity, BigDecimal> {

  @Query(
      value =
      """
        SELECT
          a.TEST_CATEGORY_CD AS testCategoryCode,
          a.RIA_COMMENT AS riaComment,
          a.ACTUAL_END_DT_TM AS actualEndDateTime,
          a.ACTUAL_BEGIN_DT_TM AS actualBeginDateTime
        FROM CONSEP.CNS_T_RQST_ITM_ACTVTY a
        WHERE a.RIA_SKEY = ?1
      """,
      nativeQuery = true)
  Optional<ActivityEntity> findMccColumnsByRiaKey(BigDecimal riaKey);
}
