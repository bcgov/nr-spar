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

  /**
   * Delete the tray by ID. Used after detaching all tests for optimistic concurrency check.
   *
   * @param germinatorTrayId the tray ID to delete
   * @return the number of rows deleted (0 or 1)
   */
  @Modifying
  @Transactional
  @Query("""
      DELETE FROM GerminatorTrayEntity t
       WHERE t.germinatorTrayId = :germinatorTrayId
      """)
  int deleteByGerminatorTrayId(@Param("germinatorTrayId") Integer germinatorTrayId);
}
