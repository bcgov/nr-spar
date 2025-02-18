package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.ReplicateEntity;
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
public interface ReplicateRepository extends JpaRepository<ReplicateEntity, BigDecimal> {

  @Query(
      value = """
        SELECT r
        FROM CONSEP.CNS_T_TEST_REP_MC r
        WHERE r.RIA_SKEY = ?1
        AND r.TEST_REPLICATE_NO IN ?2
      """,
      nativeQuery = true)
    List<ReplicateEntity> findByRiaKeyAndReplicateNumbers(
        BigDecimal riaKey,
        List<Integer> testReplicateNumbers
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

  @Query(
      value = """
        DELETE FROM CONSEP.CNS_T_TEST_REP_MC
        WHERE RIA_SKEY = ?1
        AND TEST_REPLICATE_NO = ?2
      """,
      nativeQuery = true)
    void deleteByRiaKeyAndReplicateNumber(
        BigDecimal riaKey,
        Integer testReplicateNumber
    );

  @Modifying
  @Query(value = "UPDATE CONSEP.CNS_T_TEST_REP_MC SET " +
                 "   CASE " +
                 "       WHEN :field = 'containerId' THEN CONTAINER_ID = :value " +
                 "       WHEN :field = 'containerWeight' THEN CONTAINER_WEIGHT = :value " +
                 "       WHEN :field = 'freshSeed' THEN FRESH_WEIGHT = :value " +
                 "       WHEN :field = 'containerAndDryWeight' THEN CNTNR_AND_DRY_WGHT = :value " +
                 "       WHEN :field = 'dryWeight' THEN DRY_WEIGHT = :value " +
                 "       WHEN :field = 'replicateAccInd' THEN REP_ACCEPTED_IND = :value " +
                 "       WHEN :field = 'replicateComment' THEN REPLICATE_COMMENT = :value " +
                 "       WHEN :field = 'overrideReason' THEN TOLRNC_OVRRDE_DESC = :value " +
                 "   END " +
                 "WHERE RIA_SKEY = :riaKey AND TEST_REPLICATE_NO = :replicateNumber",
          nativeQuery = true)
    void updateField(
        @Param("riaKey") BigDecimal riaKey,
        @Param("replicateNumber") Integer replicateNumber,
        @Param("field") String field,
        @Param("value") Object value
    );
}
