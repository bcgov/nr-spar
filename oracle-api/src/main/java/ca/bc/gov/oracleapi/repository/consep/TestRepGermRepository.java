package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.TestRepGermEntity;
import ca.bc.gov.oracleapi.entity.consep.idclass.ReplicateId;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * This interface enables the germination test replicate entity from consep
 * to be retrieved from the database.
 */
public interface TestRepGermRepository
    extends JpaRepository<TestRepGermEntity, ReplicateId> {

  @Query(
      value = """
        SELECT *
          FROM CONSEP.CNS_T_TEST_REP_GERM
         WHERE RIA_SKEY = :riaKey
         ORDER BY TEST_REPLICATE_NO
      """,
      nativeQuery = true)
  List<TestRepGermEntity> findByRiaKeyOrderByReplicateNumber(
      @Param("riaKey") BigDecimal riaKey);
}
