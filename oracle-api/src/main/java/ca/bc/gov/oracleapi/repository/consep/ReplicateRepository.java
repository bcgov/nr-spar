package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.ReplicateEntity;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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
}
