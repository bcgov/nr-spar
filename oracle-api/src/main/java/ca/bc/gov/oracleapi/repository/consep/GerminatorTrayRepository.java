package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.dto.consep.GerminatorTraySearchResponseDto;
import ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

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

  /**
   * Delete the tray by ID only if its revision count still matches (optimistic lock).
   *
   * @param germinatorTrayId the tray ID to delete
   * @param revisionCount    the revision count the caller read
   * @return the number of rows deleted (0 or 1)
   */
  @Modifying
  @Transactional
  @Query(
      """
      DELETE FROM GerminatorTrayEntity t
       WHERE t.germinatorTrayId = :germinatorTrayId
         AND t.revisionCount = :revisionCount
      """)
  int deleteByGerminatorTrayIdAndRevisionCount(
      @Param("germinatorTrayId") Integer germinatorTrayId,
      @Param("revisionCount") Long revisionCount
  );

  /**
   * Set the germinator ID and bump the revision count, only if the revision count still matches
   * the one the caller read (optimistic lock).
   *
   * @param germinatorTrayId the tray ID
   * @param germinatorId     the germinator ID, or null to unassign
   * @param revisionCount    the revision count the caller read
   * @return the number of rows updated (0 or 1)
   */
  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Transactional
  @Query(
      """
      UPDATE GerminatorTrayEntity t
         SET t.germinatorId = :germinatorId,
             t.revisionCount = t.revisionCount + 1
       WHERE t.germinatorTrayId = :germinatorTrayId
         AND t.revisionCount = :revisionCount
      """)
  int updateGerminatorIdWhereRevisionMatches(
      @Param("germinatorTrayId") Integer germinatorTrayId,
      @Param("germinatorId") String germinatorId,
      @Param("revisionCount") Long revisionCount
  );

  /** Trays by ID, in ID order; IDs that do not exist are left out. */
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
      WHERE tray.germinatorTrayId IN :germinatorTrayIds
      ORDER BY tray.germinatorTrayId
      """)
  List<GerminatorTraySearchResponseDto> findTraysByIds(
      @Param("germinatorTrayIds") List<Integer> germinatorTrayIds
  );

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
}
