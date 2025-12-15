package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.TestCodeEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/**
 * This interface enables test code entities from CONSEP to be queried in the database.
 */
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

  @Query("""
        SELECT
          c.codeArgument AS code,
          c.expandedResult AS description
        FROM TestCodeSubsetEntity s
        JOIN TestCodeEntity c
        ON c.columnName = s.columnName
        AND c.codeArgument = s.codeArgument
        WHERE s.codeSubsetName = 'REQUEST_TYPE_ST'
        AND s.columnName = 'SEEDLOT_TRNSCTN_CD'
        AND s.inEffectDate <= CURRENT_DATE
        AND (s.expiredDate IS NULL OR s.expiredDate >= CURRENT_DATE)
        AND c.effectiveDate <= CURRENT_DATE
        AND (c.expiryDate IS NULL OR c.expiryDate >= CURRENT_DATE)
      """)
  List<Object[]> findRequestTypes();
}
