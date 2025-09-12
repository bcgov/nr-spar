package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.TestCodeEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TestCodeRepository extends JpaRepository<TestCodeEntity, String> {

  @Query("""
        SELECT t.codeArgument AS code, t.expandedResult AS description
        FROM TestCodeEntity t
        WHERE t.columnName = 'ACTIVITY_TYPE_CD'
          AND t.effectiveDate <= CURRENT_DATE
          AND (t.expiryDate IS NULL OR t.expiryDate >= CURRENT_DATE)
        """)
  List<Object[]> findTestTypeCodes();

  @Query("""
        SELECT t.codeArgument AS code, t.expandedResult AS description
        FROM TestCodeEntity t
        WHERE t.columnName = 'TEST_CATEGORY_CD'
          AND t.effectiveDate <= CURRENT_DATE
          AND (t.expiryDate IS NULL OR t.expiryDate >= CURRENT_DATE)
        """)
  List<Object[]> findTestCategoryCodes();
}
