package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * This interface enables the germinator tray entity from consep to be retrieved from the database.
 */
public interface GerminatorTrayRepository extends JpaRepository<GerminatorTrayEntity, Integer> {
}
