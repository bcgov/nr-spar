package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.TestCodeEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


/**
 * This interface enables test code entities from CONSEP to be queried in the database.
 */
public interface TestCodeRepository extends JpaRepository<TestCodeEntity, Object> {

  @Query("""
        SELECT t.id.codeArgument AS code,
               t.expandedResult AS description
        FROM TestCodeEntity t
        WHERE t.id.columnName = 'ACTIVITY_TYPE_CD'
          AND t.effectiveDate <= CURRENT_DATE
          AND (t.expiryDate IS NULL OR t.expiryDate >= CURRENT_DATE)
        """)
  List<Object[]> findTestTypeCodes();

  @Query("""
        SELECT t.id.codeArgument AS code,
               t.expandedResult AS description
        FROM TestCodeEntity t
        WHERE t.id.columnName = 'TEST_CATEGORY_CD'
          AND t.effectiveDate <= CURRENT_DATE
          AND (t.expiryDate IS NULL OR t.expiryDate >= CURRENT_DATE)
        """)
  List<Object[]> findTestCategoryCodes();

  @Query("""
        SELECT t.id.codeArgument AS code
        FROM TestCodeEntity t
        WHERE t.id.columnName = :activity
          AND t.effectiveDate <= CURRENT_DATE
          AND (t.expiryDate IS NULL OR t.expiryDate >= CURRENT_DATE)
        ORDER BY t.id.codeArgument
        """)
  List<Object[]> findCodesByActivity(String activity);

  @Query("""
        SELECT
          c.id.codeArgument AS code,
          c.expandedResult AS description
        FROM TestCodeSubsetEntity s
        JOIN TestCodeEntity c
          ON c.id.columnName = s.id.columnName
         AND c.id.codeArgument = s.id.codeArgument
        WHERE s.id.codeSubsetName = 'REQUEST_TYPE_ST'
          AND s.id.columnName = 'SEEDLOT_TRNSCTN_CD'
          AND s.inEffectDate <= CURRENT_DATE
          AND (s.expiredDate IS NULL OR s.expiredDate >= CURRENT_DATE)
          AND c.effectiveDate <= CURRENT_DATE
          AND (c.expiryDate IS NULL OR c.expiryDate >= CURRENT_DATE)
        """)
  List<Object[]> findRequestTypes();
}
