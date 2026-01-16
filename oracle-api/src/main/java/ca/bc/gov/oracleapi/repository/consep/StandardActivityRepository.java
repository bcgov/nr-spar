package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.StandardActivityEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/**
 * This interface enables the standard activity entity
 * from consep to be retrieved from the database.
 */
public interface StandardActivityRepository extends JpaRepository<StandardActivityEntity, String> {
  @Query("""
      SELECT sa
      FROM StandardActivityEntity sa
      JOIN TestCodeEntity c
      ON sa.standardActivityId = c.id.codeArgument
      WHERE c.id.columnName = 'FAMILYLOT_TEST_CD'
      ORDER BY sa.activityDesc ASC
      """)
  List<StandardActivityEntity> findAllFamilyLotActivities();
}