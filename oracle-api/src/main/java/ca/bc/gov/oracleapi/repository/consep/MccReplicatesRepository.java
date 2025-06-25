package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.MccReplicateEntity;
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
public interface MccReplicatesRepository extends JpaRepository<MccReplicateEntity, ReplicateId> {

  @Query(
      value = """
        SELECT *
        FROM CONSEP.CNS_T_TEST_REP_MC
        WHERE RIA_SKEY = :riaKey
        AND TEST_REPLICATE_NO IN (:testReplicateNumbers)
      """,
      nativeQuery = true)
    List<MccReplicateEntity> findByRiaKeyAndReplicateNumbers(
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
    Optional<MccReplicateEntity> findSingleReplicate(
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

  @Modifying
  @Transactional
  @Query(
      value = """
        DELETE FROM CONSEP.CNS_T_TEST_REP_MC
        WHERE RIA_SKEY = :riaKey
        AND TEST_REPLICATE_NO IN (:testReplicateNumbers)
      """,
      nativeQuery = true)
    void deleteByRiaKeyAndReplicateNumbers(
        @Param("riaKey") BigDecimal riaKey,
        @Param("testReplicateNumbers") List<Integer> testReplicateNumbers
    );

  @Modifying
  @Transactional
  @Query(value = """
      MERGE INTO CONSEP.CNS_T_TEST_REP_MC t
      USING (
        SELECT
          RIA_SKEY,
          TEST_REPLICATE_NO,
          ROW_NUMBER() OVER (ORDER BY TEST_REPLICATE_NO) AS new_number
        FROM CONSEP.CNS_T_TEST_REP_MC
        WHERE RIA_SKEY = :riaKey
      ) src
      ON (t.RIA_SKEY = src.RIA_SKEY AND t.TEST_REPLICATE_NO = src.TEST_REPLICATE_NO)
      WHEN MATCHED THEN UPDATE SET t.TEST_REPLICATE_NO = src.new_number
      """, nativeQuery = true)
  void reorderTestReplicateNumbers(@Param("riaKey") BigDecimal riaKey);
}
