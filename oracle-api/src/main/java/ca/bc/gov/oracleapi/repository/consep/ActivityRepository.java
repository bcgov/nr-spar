package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * This interface enables the activity entity from consep to be retrieved from the database.
 */
public interface ActivityRepository extends JpaRepository<ActivityEntity, BigDecimal> {
  @Modifying
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
      SELECT a.riaKey, s.activityDesc
      FROM ActivityEntity a
      JOIN StandardActivityEntity s ON s.standardActivityId = a.standardActivityId
      WHERE a.requestSkey = :requestSkey
        AND a.itemId = :itemId
      ORDER BY a.revisedStartDate
      """)
  List<Object[]> findActivityByRequestSkeyAndItemId(
      @Param("requestSkey") BigDecimal requestSkey,
      @Param("itemId") String itemId
  );

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
}
