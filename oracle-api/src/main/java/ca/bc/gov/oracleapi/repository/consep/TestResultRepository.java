package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.dto.consep.GermTestResultDto;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import java.math.BigDecimal;
import java.time.LocalDate;
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

  @Modifying
  @Transactional
  @Query(
      value = "UPDATE CONSEP.CNS_T_TSC_TEST_RESULT "
            + "SET MOISTURE_PCT = (:average) "
            + "WHERE RIA_SKEY = (:riaKey)",
      nativeQuery = true)
  void updateTestResultAvgValue(
      @Param("riaKey") BigDecimal riaKey,
      @Param("average") Double average
  );

  @Query("""
        SELECT
          rst.warmStratStartDate,
          tr.warmStratHours,
          rst.drybackStartDate,
          rst.activityType,
          tr.soakHours,
          tr.stratHours,
          rst.seedWithdrawDate,
          rst.germinatorTrayId
        FROM TestResultEntity rst
        JOIN TestRegimeEntity tr
          ON rst.activityType = tr.seedlotTestCode
        WHERE rst.riaKey = :riaKey
      """)
  GermTestResultDto getGermTestResult(
      @Param("riaKey") BigDecimal riaKey
  );

  @Modifying
  @Transactional
  @Query("""
      UPDATE TestResultEntity rst
         SET rst.germinatorTrayId = :trayId,
             rst.warmStratStartDate =
               CASE
                 WHEN :warmStratHours IS NOT NULL
                 THEN :trayWarmStratDate
                 ELSE rst.warmStratStartDate
               END,
             rst.stratStartDate = :trayColdStratDate,
             rst.drybackStartDate =
               CASE
                 WHEN rst.activityType = 'G64'
                 THEN :trayDrybackDate
                 ELSE rst.drybackStartDate
               END,
             rst.germinatorEntry = :trayGerminatorEntryDate,
             rst.updateTimestamp = CURRENT_TIMESTAMP
       WHERE rst.riaKey = :riaKey
      """)
  void saveGerminatorTray(
      @Param("riaKey") BigDecimal riaKey,
      @Param("trayId") Integer trayId,
      @Param("warmStratHours") Integer warmStratHours,
      @Param("trayWarmStratDate") LocalDate trayWarmStratDate,
      @Param("trayColdStratDate") LocalDate trayColdStratDate,
      @Param("trayDrybackDate") LocalDate trayDrybackDate,
      @Param("trayGerminatorEntryDate") LocalDate trayGerminatorEntryDate
  );

  @Modifying
  @Transactional
  @Query("""
      UPDATE TestResultEntity rst
         SET rst.germinatorTrayId = :trayId,
             rst.updateTimestamp = CURRENT_TIMESTAMP
       WHERE rst.riaKey = :riaKey
      """)
  void updateGerminatorTray(
      @Param("riaKey") BigDecimal riaKey,
      @Param("trayId") Integer trayId
  );
}
