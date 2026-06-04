package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.dto.consep.GermTestResultDto;
import ca.bc.gov.oracleapi.dto.consep.GerminationTestHeaderDto;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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
          rst.activityType as activityTypeCd,
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

  /**
   * Detach a test from its tray by setting germinator_tray_id to null.
   *
   * @param riaKey the request item activity key (RIA_SKEY)
   * @return the number of rows updated (0 or 1)
   */
  @Modifying
  @Transactional
  @Query("""
      UPDATE TestResultEntity rst
         SET rst.germinatorTrayId = NULL,
             rst.updateTimestamp = CURRENT_TIMESTAMP
       WHERE rst.riaKey = :riaKey
      """)
  int detachTestFromTray(@Param("riaKey") BigDecimal riaKey);

  /**
   * Find all RIA_SKEY values for tests currently on the given tray.
   */
  @Query("""
      SELECT rst.riaKey FROM TestResultEntity rst
       WHERE rst.germinatorTrayId = :germinatorTrayId
      """)
  List<BigDecimal> findRiaKeysByGerminatorTrayId(
      @Param("germinatorTrayId") Integer germinatorTrayId
  );

  /**
   * Count how many tests are on the given tray.
   */
  int countByGerminatorTrayId(Integer germinatorTrayId);

  @Query("""
      SELECT COUNT(rst)
      FROM TestResultEntity rst
      JOIN ActivityEntity act
        ON act.riaKey = rst.riaKey
      WHERE act.seedlotNumber = :seedlotNumber
        AND rst.testCategory = 'STD'
        AND rst.acceptResult = 1
        AND rst.testRank = 'A'
      """)
  long countAcceptedStdRankA(
      @Param("seedlotNumber") String seedlotNumber
  );

  @Query(
      """
      SELECT new ca.bc.gov.oracleapi.dto.consep.GerminationTestHeaderDto(
            tst.riaKey,
            tst.activityType,
            a.actualBeginDateTime,
            a.actualEndDateTime,
            a.testCategoryCode,
            tst.moistureStatus,
            tst.sampleDesc,
            tst.acceptResult,
            tst.testCompleteInd,
            a.riaComment,
            tst.standardTest,
            tst.testRank,
            tst.germinationPct,
            tst.germinationValue,
            tst.peakValueGrmPct,
            tst.peakValueNoDays,
            tst.seedWithdrawDate,
            a.revisedStartDate,
            a.revisedEndDate,
            a.activityDuration,
            a.activityTimeUnit,
            tst.stratStartDate,
            tst.drybackStartDate,
            tst.warmStratStartDate,
            tst.germinatorEntry,
            tst.germinatorTrayId,
            tst.germinatorId,
            null,
            a.imbibedWeight,
            a.dryWeight,
            a.drybackWeight,
            a.intermediateCleaner,
            r.requestTypeSt
    )
    FROM TestResultEntity tst
    JOIN ActivityEntity a
      ON a.riaKey = tst.riaKey
    JOIN SparRequestEntity r
      ON r.requestSkey = a.requestSkey
    WHERE tst.riaKey = :riaKey
      """)
  Optional<GerminationTestHeaderDto> findGerminationTestHeaderByRiaKey(
      @Param("riaKey") BigDecimal riaKey
  );

  /**
   * Earliest actual end among completed (+accepted) tests of the same
   * seedlot / activity type / category. Spec: "Update (test and activity)".
   */
  @Query("""
      SELECT MIN(a.actualEndDateTime)
      FROM TestResultEntity t
      JOIN ActivityEntity a
        ON a.riaKey = t.riaKey
      WHERE a.seedlotNumber = :seedlotNumber
        AND t.activityType = :activityType
        AND t.testCategory = :testCategory
        AND t.testCompleteInd = -1
        AND t.acceptResult = -1
      """)
  LocalDateTime findMinCompletedAcceptedEndDate(
      @Param("seedlotNumber") String seedlotNumber,
      @Param("activityType") String activityType,
      @Param("testCategory") String testCategory);

  /** Latest actual end among completed (+accepted) tests; see min variant. */
  @Query("""
      SELECT MAX(a.actualEndDateTime)
      FROM TestResultEntity t
      JOIN ActivityEntity a
        ON a.riaKey = t.riaKey
      WHERE a.seedlotNumber = :seedlotNumber
        AND t.activityType = :activityType
        AND t.testCategory = :testCategory
        AND t.testCompleteInd = -1
        AND t.acceptResult = -1
      """)
  LocalDateTime findMaxCompletedAcceptedEndDate(
      @Param("seedlotNumber") String seedlotNumber,
      @Param("activityType") String activityType,
      @Param("testCategory") String testCategory);

  /** All rank 'A' tests for a seedlot (rank computation input). */
  @Query("""
      SELECT t
      FROM TestResultEntity t
      JOIN ActivityEntity a
        ON a.riaKey = t.riaKey
      WHERE a.seedlotNumber = :seedlotNumber
        AND t.testRank = 'A'
      """)
  List<TestResultEntity> findRankATestsBySeedlot(
      @Param("seedlotNumber") String seedlotNumber);

  /**
   * Update the germination test header with optimistic locking.
   * Related Test Results columns are zeroed on save per spec.
   *
   * @return rows updated; 0 means the row changed since it was read (409).
   */
  @Modifying
  @Transactional
  @Query("""
      UPDATE TestResultEntity t
         SET t.originalTest = :originalTest,
             t.currentTest = :currentTest,
             t.testRank = :testRank,
             t.testCompleteInd = :testCompleteInd,
             t.acceptResult = :acceptResult,
             t.germinatorId = :germinatorId,
             t.seedWithdrawDate = :seedWithdrawDate,
             t.testCategory = :testCategory,
             t.moisturePct = 0,
             t.weightPer100 = 0,
             t.seedsPerGram = 0,
             t.purityPct = 0,
             t.otherTestResult = 0,
             t.updateTimestamp = CURRENT_TIMESTAMP
       WHERE t.riaKey = :riaKey
         AND t.updateTimestamp = :expectedUpdateTimestamp
      """)
  int updateGerminationTestHeader(
      @Param("riaKey") BigDecimal riaKey,
      @Param("originalTest") Integer originalTest,
      @Param("currentTest") Integer currentTest,
      @Param("testRank") String testRank,
      @Param("testCompleteInd") Integer testCompleteInd,
      @Param("acceptResult") Integer acceptResult,
      @Param("germinatorId") String germinatorId,
      @Param("seedWithdrawDate") LocalDate seedWithdrawDate,
      @Param("testCategory") String testCategory,
      @Param("expectedUpdateTimestamp") LocalDateTime expectedUpdateTimestamp);

  /** Reset original_test_ind on sibling tests (post-update, AC #5). */
  @Modifying
  @Transactional
  @Query("""
      UPDATE TestResultEntity t
         SET t.originalTest = 0,
             t.updateTimestamp = CURRENT_TIMESTAMP
       WHERE t.riaKey <> :riaKey
         AND t.activityType = :activityType
         AND t.testCategory = :testCategory
         AND EXISTS (
               SELECT 1 FROM ActivityEntity a
                WHERE a.riaKey = t.riaKey
                  AND a.seedlotNumber = :seedlotNumber)
      """)
  int resetOriginalTestIndForSiblings(
      @Param("riaKey") BigDecimal riaKey,
      @Param("activityType") String activityType,
      @Param("testCategory") String testCategory,
      @Param("seedlotNumber") String seedlotNumber);

  /** Reset current_test_ind on sibling tests (post-update, AC #5). */
  @Modifying
  @Transactional
  @Query("""
      UPDATE TestResultEntity t
         SET t.currentTest = 0,
             t.updateTimestamp = CURRENT_TIMESTAMP
       WHERE t.riaKey <> :riaKey
         AND t.activityType = :activityType
         AND t.testCategory = :testCategory
         AND EXISTS (
               SELECT 1 FROM ActivityEntity a
                WHERE a.riaKey = t.riaKey
                  AND a.seedlotNumber = :seedlotNumber)
      """)
  int resetCurrentTestIndForSiblings(
      @Param("riaKey") BigDecimal riaKey,
      @Param("activityType") String activityType,
      @Param("testCategory") String testCategory,
      @Param("seedlotNumber") String seedlotNumber);

  /**
   * Remove the test from its germinator location when Complete is first
   * checked. No entity maps CNS_T_ASSIGND_GERM_LOC, hence native SQL.
   */
  @Modifying
  @Transactional
  @Query(
      value = "DELETE FROM CONSEP.CNS_T_ASSIGND_GERM_LOC WHERE RIA_SKEY = :riaKey",
      nativeQuery = true)
  void deleteAssignedGermLocation(@Param("riaKey") BigDecimal riaKey);
}
