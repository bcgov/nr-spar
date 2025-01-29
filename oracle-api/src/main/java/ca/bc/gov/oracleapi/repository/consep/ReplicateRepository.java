package ca.bc.gov.oracleapi.repository.consep;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ca.bc.gov.oracleapi.entity.consep.ReplicateEntity;
import java.math.BigDecimal;
import java.util.Optional;

/**
 * This interface enables the replicate entity from consep to be retrieved from the database.
 */
public interface ReplicateRepository extends JpaRepository<ReplicateEntity, BigDecimal> {

  @Query("SELECT r FROM ReplicateEntity r WHERE r.riaKey = :riaKey AND r.replicateNumber = :testReplicateNumber")
    Optional<ReplicateEntity> findByRiaKeyAndReplicateNumber(
        @Param("riaKey") BigDecimal riaKey,
        @Param("testReplicateNumber") Integer testReplicateNumber
    );
}
