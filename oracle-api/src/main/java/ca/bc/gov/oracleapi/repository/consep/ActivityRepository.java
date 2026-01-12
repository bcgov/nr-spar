package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

/**
 * This interface enables the activity entity from consep to be retrieved from the database.
 */
public interface ActivityRepository extends JpaRepository<ActivityEntity, BigDecimal> {
  @Modifying
  @Transactional
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
}
