package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import java.math.BigDecimal;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

  @Modifying
  @Query(
      value =
      """
        UPDATE CONSEP.CNS_T_RQST_ITM_ACTVTY
        SET
          TEST_CATEGORY_CD = CASE
            WHEN :field = 'testCategoryCode' THEN :value
            ELSE TEST_CATEGORY_CD
          END,
          RIA_COMMENT = CASE
            WHEN :field = 'riaComment' THEN :value
            ELSE RIA_COMMENT
          END,
          ACTUAL_END_DT_TM = CASE
            WHEN :field = 'actualEndDateTime' THEN :value
            ELSE ACTUAL_END_DT_TM
          END,
          ACTUAL_BEGIN_DT_TM = CASE
            WHEN :field = 'actualBeginDateTime' THEN :value
            ELSE ACTUAL_BEGIN_DT_TM
          END
        WHERE RIA_SKEY = :riaKey
      """,
      nativeQuery = true)
  void updateField(
      @Param("riaKey") BigDecimal riaKey,
      @Param("field") String field,
      @Param("value") Object value
  );
}
