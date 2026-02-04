package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.TestRegimeEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/**
 * This interface enables test regime entities from CONSEP to be queried in the database.
 */
public interface TestRegimeRepository extends JpaRepository<TestRegimeEntity, String> {
  @Query("select t.seedlotTestCode from TestRegimeEntity t")
  List<String> findAllGermTestActivityTypeCodes();
}
