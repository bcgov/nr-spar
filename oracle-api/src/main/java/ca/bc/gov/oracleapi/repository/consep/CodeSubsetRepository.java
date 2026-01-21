package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.TestCodeSubsetEntity;
import ca.bc.gov.oracleapi.entity.consep.idclass.TestCodeSubsetId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/**
 * This interface enables code subset entities from CONSEP to be queried in the database.
 */
public interface CodeSubsetRepository
    extends JpaRepository<TestCodeSubsetEntity, TestCodeSubsetId> {

  @Query("""
        SELECT t.id.codeArgument as code
        FROM TestCodeSubsetEntity t
        WHERE t.id.columnName = 'UNIT_OF_MEASURE_CD'
          AND t.id.codeSubsetName = 'ACTVTY_TM_UNIT_ST'
          AND t.inEffectDate <= CURRENT_DATE
          AND (t.expiredDate IS NULL OR t.expiredDate >= CURRENT_DATE)
        ORDER BY t.id.codeArgument
        """)
  List<String> findActivityDurationTimeUnit();
}