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
        SELECT r
        FROM CONSEP.CNS_T_TEST_REP_MC r
        WHERE r.RIA_SKEY = ?1
        AND r.TEST_REPLICATE_NO = ?2
      """,
      nativeQuery = true)
    Optional<ReplicateEntity> findSingleReplicate(
        BigDecimal riaKey,
        Integer testReplicateNumber
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
  @Query(
      value =
      """
        UPDATE CONSEP.CNS_T_TEST_REP_MC
        SET
          CONTAINER_ID = CASE
            WHEN :field = 'containerId' THEN :value
            ELSE CONTAINER_ID
          END,
          CONTAINER_WEIGHT = CASE
            WHEN :field = 'containerWeight' THEN :value
            ELSE CONTAINER_WEIGHT
          END,
          FRESH_WEIGHT = CASE
            WHEN :field = 'freshSeed' THEN :value
            ELSE FRESH_WEIGHT
          END,
          CNTNR_AND_DRY_WGHT = CASE
            WHEN :field = 'containerAndDryWeight' THEN :value
            ELSE CNTNR_AND_DRY_WGHT
          END,
          DRY_WEIGHT = CASE
            WHEN :field = 'dryWeight' THEN :value
            ELSE DRY_WEIGHT
          END,
          REP_ACCEPTED_IND = CASE
            WHEN :field = 'replicateAccInd' THEN :value
            ELSE REP_ACCEPTED_IND
          END,
          REPLICATE_COMMENT = CASE
            WHEN :field = 'replicateComment' THEN :value
            ELSE REPLICATE_COMMENT
          END,
          TOLRNC_OVRRDE_DESC = CASE
            WHEN :field = 'overrideReason' THEN :value
            ELSE TOLRNC_OVRRDE_DESC
          END
        WHERE RIA_SKEY = :riaKey
        AND TEST_REPLICATE_NO = :replicateNumber
      """,
      nativeQuery = true)
    void updateField(
        @Param("riaKey") BigDecimal riaKey,
        @Param("replicateNumber") Integer replicateNumber,
        @Param("field") String field,
        @Param("value") Object value
    );
}
