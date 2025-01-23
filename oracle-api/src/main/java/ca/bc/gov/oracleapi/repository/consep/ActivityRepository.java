package ca.bc.gov.oracleapi.repository.consep;

import org.springframework.data.jpa.repository.JpaRepository;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;

/**
 * This interface enables the activity entity from consep to be retrieved from the database.
 */
public interface ActivityRepository extends JpaRepository<ActivityEntity, String> {}
