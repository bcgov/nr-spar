package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.SparRequestEntity;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * This interface enables the spar request entity from consep to be retrieved from the database.
 */
public interface SparRequestRepository extends JpaRepository<SparRequestEntity, BigDecimal> {
  @Query("SELECT s.requestTypeSt FROM SparRequestEntity s WHERE s.requestSkey = :requestSkey")
  String findRequestTypeStByRequestSkey(@Param("requestSkey") BigDecimal requestSkey);
}
