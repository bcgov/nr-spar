package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.PurityDebrisEntity;
import ca.bc.gov.oracleapi.entity.consep.idclass.DebrisId;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * This interface enables the purities test's debris entity from consep to be retrieved
 * from the database.
 */
public interface PurityDebrisRepository extends JpaRepository<PurityDebrisEntity, DebrisId> {

  @Query(
      value = """
        SELECT *
        FROM CONSEP.CNS_T_DEBRIS_TEST
        WHERE RIA_SKEY = :riaKey
        AND TEST_REPLICATE_NO IN (:testReplicateNumbers)
      """,
      nativeQuery = true)
    List<PurityDebrisEntity> findByRiaKeyAndReplicateNumbers(
        @Param("riaKey") BigDecimal riaKey,
        @Param("testReplicateNumbers") List<Integer> testReplicateNumbers
    );

  @Query(
      value = """
        SELECT *
        FROM CONSEP.CNS_T_DEBRIS_TEST
        WHERE RIA_SKEY = :riaKey
        AND TEST_REPLICATE_NO = :testReplicateNumber
      """,
      nativeQuery = true)
    Optional<PurityDebrisEntity> findSingleDebris(
        @Param("riaKey") BigDecimal riaKey,
        @Param("testReplicateNumber") Integer testReplicateNumber
    );

  Optional<PurityDebrisEntity> findByIdRiaKeyAndIdReplicateNumberAndIdDebrisRank(
      BigDecimal riaKey,
      Integer replicateNumber,
      Integer debrisRank);

  @Modifying
  @Transactional
  @Query(
      value = """
        DELETE FROM CONSEP.CNS_T_DEBRIS_TEST
        WHERE RIA_SKEY = :riaKey
        AND TEST_REPLICATE_NO = :testReplicateNumber
        AND DEBRIS_RANK = :debrisRank
      """,
      nativeQuery = true)
    void deleteByRank(
        @Param("riaKey") BigDecimal riaKey,
        @Param("testReplicateNumber") Integer testReplicateNumber,
        @Param("debrisRank") Integer debrisRank
    );

  @Modifying
  @Transactional
  @Query(
      value = """
        UPDATE CONSEP.CNS_T_DEBRIS_TEST
        SET DEBRIS_RANK = DEBRIS_RANK - 1
        WHERE RIA_SKEY = :riaKey
        AND TEST_REPLICATE_NO = :replicateNumber
        AND DEBRIS_RANK > :removedRank
      """,
      nativeQuery = true)
    int shiftRanksDown(
        @Param("riaKey") BigDecimal riaKey,
        @Param("replicateNumber") Integer replicateNumber,
        @Param("removedRank") Integer removedRank
    );
}
