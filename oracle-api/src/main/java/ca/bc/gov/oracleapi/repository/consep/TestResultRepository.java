package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

/**
 * This interface enables the test result entity from consep to be retrieved from the database.
 */
public interface TestResultRepository extends JpaRepository<TestResultEntity, BigDecimal> {
  //Query to update the test result entity as completed
  @Modifying
  @Transactional
  @Query(
      value = "UPDATE CONSEP.CNS_T_TSC_TEST_RESULT "
            + "SET TEST_COMPLETE_IND = 1 "
            + "WHERE RIA_SKEY = (:riaKey)",
      nativeQuery = true)
  void updateTestResultStatusToCompleted(@Param("riaKey") BigDecimal riaKey);

  //Query to update the test result entity as accepted
  @Modifying
  @Transactional
  @Query(
      value = "UPDATE CONSEP.CNS_T_TSC_TEST_RESULT "
            + "SET ACCEPT_RESULT_IND = 1 "
            + "WHERE RIA_SKEY = (:riaKey)",
      nativeQuery = true)
  void updateTestResultStatusToAccepted(@Param("riaKey") BigDecimal riaKey);
}
