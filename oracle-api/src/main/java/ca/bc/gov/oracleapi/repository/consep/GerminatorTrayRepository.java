package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

/**
 * This interface enables the germinator tray entity from consep to be retrieved from the database.
 */
public interface GerminatorTrayRepository extends JpaRepository<GerminatorTrayEntity, Integer> {
  @Modifying(clearAutomatically = true)
  @Transactional
  @Query("""
      DELETE FROM GerminatorTrayEntity gtr
       WHERE gtr.germinatorTrayId = :trayId
         AND gtr.revisionCount = :revisionCount
      """)
  int deleteByIdAndRevisionCount(
      @Param("trayId") Integer trayId,
      @Param("revisionCount") Long revisionCount
  );

  @Modifying(clearAutomatically = true)
  @Transactional
  @Query("""
      UPDATE GerminatorTrayEntity gtr
         SET gtr.revisionCount = gtr.revisionCount + 1
       WHERE gtr.germinatorTrayId = :trayId
         AND gtr.revisionCount = :revisionCount
      """)
  int incrementRevisionCountWithVersionCheck(
      @Param("trayId") Integer trayId,
      @Param("revisionCount") Long revisionCount
  );
}
