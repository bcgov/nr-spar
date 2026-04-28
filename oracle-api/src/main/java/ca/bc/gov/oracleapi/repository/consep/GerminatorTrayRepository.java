package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.dto.consep.GerminationTestHeaderDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTraySearchResponseDto;
import ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

/**
 * This interface enables the germinator tray entity from consep to be retrieved from the database.
 */
public interface GerminatorTrayRepository extends JpaRepository<GerminatorTrayEntity, Integer> {

  /**
   * Delete the tray by ID. Used after detaching all tests for optimistic concurrency check.
   *
   * @param germinatorTrayId the tray ID to delete
   * @return the number of rows deleted (0 or 1)
   */
  @Modifying
  @Transactional
  @Query(
      """
      DELETE FROM GerminatorTrayEntity t
       WHERE t.germinatorTrayId = :germinatorTrayId
      """)
  int deleteByGerminatorTrayId(@Param("germinatorTrayId") Integer germinatorTrayId);

  @Query(
      """
      SELECT new ca.bc.gov.oracleapi.dto.consep.GerminatorTraySearchResponseDto(
          tray.germinatorTrayId,
          tray.activityTypeCd,
          tray.actualStartDate,
          tray.dateCreated,
          tray.revisionCount,
          tray.systemTrayNo,
          tray.germinatorId
      )
      FROM GerminatorTrayEntity tray
      WHERE EXISTS (
          SELECT tr.riaKey
          FROM TestResultEntity tr
          JOIN ActivityEntity a
            ON a.riaKey = tr.riaKey
          WHERE tr.germinatorTrayId = tray.germinatorTrayId
            AND (
              :seedlotOrFamilyLot IS NULL
              OR a.seedlotNumber = :seedlotOrFamilyLot
              OR a.familyLotNumber = :seedlotOrFamilyLot
            )
            AND (:requestId IS NULL OR a.requestId = :requestId)
            AND (:itemId IS NULL OR a.itemId = :itemId)
      )
      ORDER BY tray.germinatorTrayId
      """)
  List<GerminatorTraySearchResponseDto> searchGerminatorTrays(
      @Param("seedlotOrFamilyLot") String seedlotOrFamilyLot,
      @Param("requestId") String requestId,
      @Param("itemId") String itemId
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
          (a.actualBeginDateTime + (COALESCE(tr.soakHours, 0) / 24.0)),
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
      LEFT JOIN TestRegimeEntity tr
      ON tr.seedlotTestCode = tst.activityType
      WHERE tst.riaKey = :riaKey
      """)
  Optional<GerminationTestHeaderDto> findGerminationTestHeaderByRiaKey(
      @Param("riaKey") BigDecimal riaKey
  );
}
