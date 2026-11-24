package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.dto.consep.DrybackSaveDto;
import ca.bc.gov.oracleapi.dto.consep.DrybackScreenDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import jakarta.persistence.LockModeType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

/**
 * This interface enables the activity entity from consep to be retrieved from the database.
 */
public interface ActivityRepository extends JpaRepository<ActivityEntity, BigDecimal> {
  /**
   * Reads an activity with a row lock held until the transaction ends ({@code SELECT ... FOR
   * UPDATE}), so concurrent copies of the same test run one after the other.
   */
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("SELECT a FROM ActivityEntity a WHERE a.riaKey = :riaKey")
  Optional<ActivityEntity> findByIdForUpdate(@Param("riaKey") BigDecimal riaKey);

  @Modifying
  @Transactional
  @Query(
      value = """
          UPDATE ActivityEntity a
          SET a.processCommitIndicator = 0, a.updateTimestamp = CURRENT_TIMESTAMP
          WHERE a.requestSkey = :requestSkey
          AND a.itemId = :itemId
          AND a.processCommitIndicator = -1
          AND a.riaKey <> :riaKey
          """)
  void clearExistingProcessCommitment(BigDecimal requestSkey, String itemId, BigDecimal riaKey);

  @Query("""
        SELECT a.activityTypeCode
        FROM ActivityEntity a
        JOIN TestResultEntity t
          ON t.riaKey = a.riaKey
        WHERE t.currentTest = -1
          AND t.testRank = 'A'
          AND t.standardTest = -1
          AND t.acceptResult = -1
          AND (
            (:seedlotNumber IS NOT NULL AND a.seedlotNumber = :seedlotNumber)
            OR (:familyLotNumber IS NOT NULL AND a.familyLotNumber = :familyLotNumber)
          )
      """)
  List<String> findTypeCodeForAcceptedGermTestRankA(
      @Param("seedlotNumber") String seedlotNumber,
      @Param("familyLotNumber") String familyLotNumber
  );

  @Query(
      """
      SELECT CASE WHEN EXISTS (
          SELECT 1
          FROM ActivityEntity a
          WHERE a.seedlotNumber = :seedlotNumber
            AND a.standardActivityId = :standardActivityId
            AND a.actualBeginDateTime = :actualBeginDateTime
            AND a.actualEndDateTime = :actualEndDateTime
        ) THEN true ELSE false END
      """)
  boolean existsDuplicateGerminationTest(
      @Param("seedlotNumber") String seedlotNumber,
      @Param("standardActivityId") String standardActivityId,
      @Param("actualBeginDateTime") LocalDateTime actualBeginDateTime,
      @Param("actualEndDateTime") LocalDateTime actualEndDateTime);

  @Modifying
  @Transactional
  @Query("""
          UPDATE ActivityEntity a
             SET a.actualBeginDateTime = :actualBeginDateTime,
                 a.revisedStartDate = :revisedStartDate,
                 a.revisedEndDate = :revisedEndDate,
                 a.updateTimestamp = CURRENT_TIMESTAMP
           WHERE a.riaKey = :riaKey
      """)
  void updateActualBeginAndRevisedDates(
      @Param("riaKey") BigDecimal riaKey,
      @Param("actualBeginDateTime") LocalDateTime actualBeginDateTime,
      @Param("revisedStartDate") LocalDate revisedStartDate,
      @Param("revisedEndDate") LocalDate revisedEndDate
  );

  @Query("""
          SELECT a FROM ActivityEntity a
           WHERE a.riaKey <> :excludeRiaKey
             AND a.requestSkey = :requestSkey
             AND a.itemId = :itemId
             AND a.actualBeginDateTime IS NOT NULL
             AND a.processCommitIndicator = -1
      """)
  List<ActivityEntity> findConflictingActivities(
      @Param("excludeRiaKey") BigDecimal excludeRiaKey,
      @Param("requestSkey") BigDecimal requestSkey,
      @Param("itemId") String itemId
  );

  @Modifying
  @Transactional
  @Query("""
          UPDATE ActivityEntity a
             SET a.significantStatusIndicator = -1,
                 a.processCommitIndicator = -1,
                 a.updateTimestamp = CURRENT_TIMESTAMP
           WHERE a.riaKey = :riaKey
      """)
  void markSignificantAndCommit(
      @Param("riaKey") BigDecimal riaKey
  );

  /**
   * Update the activity's update_timestamp (for parent touch).
   * Used with optimistic concurrency: only updates if current updateTimestamp matches.
   *
   * @param riaKey           the request item activity key
   * @param updateTimestamp   the expected current update timestamp (optimistic lock)
   * @return the number of rows updated (0 or 1)
   */
  @Modifying
  @Transactional
  @Query("""
      UPDATE ActivityEntity a
         SET a.updateTimestamp = CURRENT_TIMESTAMP
       WHERE a.riaKey = :riaKey
         AND a.updateTimestamp = :updateTimestamp
      """)
  int updateTimestampWhereMatch(
      @Param("riaKey") BigDecimal riaKey,
      @Param("updateTimestamp") LocalDateTime updateTimestamp
  );

  /**
   * Update moisture/purity activity dates, category, and comment with optimistic locking
   * (issue #2516).
   *
   * @return rows updated; 0 means either the row is missing or its updateTimestamp no longer matches.
   */
  @Modifying
  @Transactional
  @Query("""
      UPDATE ActivityEntity a
         SET a.actualBeginDateTime = :actualBeginDateTime,
             a.actualEndDateTime = :actualEndDateTime,
             a.testCategoryCode = :testCategoryCode,
             a.riaComment = :riaComment,
             a.updateTimestamp = CURRENT_TIMESTAMP
       WHERE a.riaKey = :riaKey
         AND a.updateTimestamp = :expectedUpdateTimestamp
      """)
  int updateActivityFieldWithLock(
      @Param("riaKey") BigDecimal riaKey,
      @Param("actualBeginDateTime") LocalDateTime actualBeginDateTime,
      @Param("actualEndDateTime") LocalDateTime actualEndDateTime,
      @Param("testCategoryCode") String testCategoryCode,
      @Param("riaComment") String riaComment,
      @Param("expectedUpdateTimestamp") LocalDateTime expectedUpdateTimestamp);

  /**
   * Update activity dates/comment with optimistic locking (issue #2447).
   *
   * <p>The INTRMDT_CLEANR_IND column ({@code intermediateCleaner}) is repurposed by the
   * germination test screen to store the "Comment is Critical" flag, hence the
   * {@code commentIsCritical} parameter name.
   *
   * @return rows updated; 0 means the row changed since it was read (409).
   */
  @Modifying
  @Transactional
  @Query("""
      UPDATE ActivityEntity a
         SET a.actualBeginDateTime = :actualBeginDateTime,
             a.actualEndDateTime = :actualEndDateTime,
             a.revisedStartDate = :revisedStartDate,
             a.revisedEndDate = :revisedEndDate,
             a.riaComment = :riaComment,
             a.intermediateCleaner = :commentIsCritical,
             a.updateTimestamp = CURRENT_TIMESTAMP
       WHERE a.riaKey = :riaKey
         AND a.updateTimestamp = :expectedUpdateTimestamp
      """)
  int updateGerminationTestActivity(
      @Param("riaKey") BigDecimal riaKey,
      @Param("actualBeginDateTime") LocalDateTime actualBeginDateTime,
      @Param("actualEndDateTime") LocalDateTime actualEndDateTime,
      @Param("revisedStartDate") LocalDate revisedStartDate,
      @Param("revisedEndDate") LocalDate revisedEndDate,
      @Param("riaComment") String riaComment,
      @Param("commentIsCritical") Integer commentIsCritical,
      @Param("expectedUpdateTimestamp") LocalDateTime expectedUpdateTimestamp);

  /**
   * Save the G64 Dryback screen values with optimistic locking (issue #2838).
   * Also writes the recalculated revised dates, which the spec's UPDATE statement omits.
   *
   * @return rows updated; 0 means the row is missing or its updateTimestamp no longer matches.
   */
  @Modifying
  @Query("""
      UPDATE ActivityEntity a
         SET a.actualBeginDateTime = :#{#dto.actualBeginDateTime()},
             a.actualEndDateTime = :#{#dto.actualEndDateTime()},
             a.revisedStartDate = :revisedStartDate,
             a.revisedEndDate = :revisedEndDate,
             a.drybackMoist = :#{#dto.drybackMoist()},
             a.imbibedWeight = :#{#dto.imbibedWeight()},
             a.drybackWeight = :#{#dto.drybackWeight()},
             a.dryWeight = :#{#dto.dryWeight()},
             a.drybackTime = :#{#dto.drybackTime()},
             a.targetThirtyMoist = :#{#dto.targetThirtyMoist()},
             a.targetThirtyFiveMoist = :#{#dto.targetThirtyFiveMoist()},
             a.stratEndWeight = :#{#dto.stratEndWeight()},
             a.riaComment = :#{#dto.riaComment()},
             a.updateTimestamp = CURRENT_TIMESTAMP
       WHERE a.riaKey = :riaKey
         AND a.updateTimestamp = :#{#dto.updateTimestamp()}
      """)
  int updateDrybackActivityWithLock(
      @Param("riaKey") BigDecimal riaKey,
      @Param("dto") DrybackSaveDto dto,
      @Param("revisedStartDate") LocalDate revisedStartDate,
      @Param("revisedEndDate") LocalDate revisedEndDate);

  /**
   * Reschedule dependent activities to planned + dateDiff (planned NULL keeps the revised date).
   * Touches only the scheduling columns and update_timestamp.
   *
   * @return rows updated
   */
  @Modifying
  @Query("""
      UPDATE ActivityEntity a
         SET a.revisedStartDate = CASE WHEN a.plannedStartDate IS NULL THEN a.revisedStartDate
                                       ELSE a.plannedStartDate + :dateDiff day END,
             a.revisedEndDate = CASE WHEN a.plannedEndDate IS NULL THEN a.revisedEndDate
                                     ELSE a.plannedEndDate + :dateDiff day END,
             a.updateTimestamp = CURRENT_TIMESTAMP
       WHERE a.riaKey IN :riaKeys
      """)
  int shiftRevisedDates(
      @Param("riaKeys") Collection<BigDecimal> riaKeys,
      @Param("dateDiff") long dateDiff);

  /** Direct dependants of the given activities in CNS_T_RIA_DEPENDANCY (one level). */
  @Query(
      value = """
          SELECT DEPENDANT_RIA_SKEY
            FROM CONSEP.CNS_T_RIA_DEPENDANCY
           WHERE PREREQ_RIA_SKEY IN (:prereqRiaKeys)
          """,
      nativeQuery = true)
  List<BigDecimal> findDependantRiaKeys(
      @Param("prereqRiaKeys") Collection<BigDecimal> prereqRiaKeys);

  /**
   * Retrieves dryback screen data for a given Request Item Activity key.
   * Joins Activity with the current accepted Moisture Content test result.
   * Uses EXISTS subquery to find MC activities with accepted tests,
   * ensuring at most one result row per Dryback activity (no non-unique-result exceptions).
   * The storageMc field will be null if no accepted MC test exists for this seedlot.
   *
   * @param riaKey the Request Item Activity SKEY
   * @return optional containing DrybackScreenDto with all required dryback screen data
   */
  @Query("""
      SELECT new ca.bc.gov.oracleapi.dto.consep.DrybackScreenDto(
             a.riaKey,
             a.requestId,
             a.itemId,
             a.seedlotNumber,
             a.familyLotNumber,
             a.standardActivityId,
             a.activityTypeCode,
             a.actualBeginDateTime,
             a.actualEndDateTime,
             a.dryWeight,
             a.priorMoist,
             a.imbibedWeight,
             a.drybackWeight,
             a.drybackMoist,
             a.drybackTime,
             a.targetThirtyMoist,
             a.targetThirtyFiveMoist,
             a.stratEndWeight,
             t.moisturePct,
             a.riaComment,
             a.updateTimestamp
      )
      FROM ActivityEntity a
      LEFT JOIN ActivityEntity mcActivity 
        ON mcActivity.seedlotNumber = a.seedlotNumber
        AND mcActivity.activityTypeCode = 'MC'
        AND EXISTS (
          SELECT 1 FROM TestResultEntity tr
          WHERE tr.riaKey = mcActivity.riaKey
            AND tr.currentTest = -1
            AND tr.acceptResult = -1
        )
      LEFT JOIN TestResultEntity t 
        ON t.riaKey = mcActivity.riaKey
        AND t.currentTest = -1
        AND t.acceptResult = -1
      WHERE a.riaKey = :riaKey
      """)
  Optional<DrybackScreenDto> findDrybackScreenDataByRiaSkey(
      @Param("riaKey") BigDecimal riaKey
  );
}
