package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.ReplicateEntity;
import ca.bc.gov.oracleapi.entity.consep.idclass.ReplicateId;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
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
        WHERE RIA_SKEY = (:riaKey)
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
}
