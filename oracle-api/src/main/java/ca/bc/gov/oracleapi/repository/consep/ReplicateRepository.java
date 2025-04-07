package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.ReplicateEntity;
import ca.bc.gov.oracleapi.entity.consep.idclass.ReplicateId;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * This interface enables the replicate entity from consep to be retrieved from the database.
 */
public interface ReplicateRepository extends JpaRepository<ReplicateEntity, ReplicateId> {

  @Query(
      value = """
        SELECT *
        FROM CONSEP.CNS_T_TEST_REP_MC
        WHERE RIA_SKEY = :riaKey
        AND TEST_REPLICATE_NO IN (:testReplicateNumbers)
      """,
      nativeQuery = true)
    List<ReplicateEntity> findByRiaKeyAndReplicateNumbers(
        @Param("riaKey") BigDecimal riaKey,
        @Param("testReplicateNumbers") List<Integer> testReplicateNumbers
    );

  @Query(
      value = """
        SELECT *
        FROM CONSEP.CNS_T_TEST_REP_MC
        WHERE RIA_SKEY = :riaKey
        AND TEST_REPLICATE_NO = :testReplicateNumber
      """,
      nativeQuery = true)
    Optional<ReplicateEntity> findSingleReplicate(
        @Param("riaKey") BigDecimal riaKey,
        @Param("testReplicateNumber") Integer testReplicateNumber
    );

  @Modifying
  @Transactional
  @Query(
      value = """
        DELETE FROM CONSEP.CNS_T_TEST_REP_MC
        WHERE RIA_SKEY = :riaKey
        AND TEST_REPLICATE_NO = :testReplicateNumber
      """,
      nativeQuery = true)
    void deleteByRiaKeyAndReplicateNumber(
        @Param("riaKey") BigDecimal riaKey,
        @Param("testReplicateNumber") Integer testReplicateNumber
  );
}
