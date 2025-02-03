package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import java.math.BigDecimal;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/**
 * This interface enables the test result entity from consep to be retrieved from the database.
 */
public interface TestResultRepository extends JpaRepository<TestResultEntity, BigDecimal> {

  @Query(
      value = """
        SELECT
          t.TEST_COMPLETE_IND AS testCompleteInd,
          t.SAMPLE_DESC AS sampleDesc,
          t.MOISTURE_STATUS_CD AS moistureStatus,
          t.MOISTURE_PCT AS moisturePct,
          t.ACCEPT_RESULT_IND AS acceptResult
        FROM CONSEP.CNS_T_TSC_TEST_RESULT t
        WHERE t.RIA_SKEY = ?1
      """,
      nativeQuery = true)
  Optional<TestResultEntity> findSelectedColumnsByRiaKey(BigDecimal riaKey);
}
