package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import java.math.BigDecimal;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * This interface enables the test result entity from consep to be retrieved from the database.
 */
public interface TestResultRepository extends JpaRepository<TestResultEntity, BigDecimal> {

  @Query("SELECT t.testCompleteInd, t.sampleDesc, t.moistureStatus, t.moisturePct, t.acceptResult "
          + "FROM TestResultEntity t WHERE t.riaKey = :riaKey")
  Optional<TestResultEntity> findSelectedColumnsByRiaKey(@Param("riaKey") BigDecimal riaKey);
}
