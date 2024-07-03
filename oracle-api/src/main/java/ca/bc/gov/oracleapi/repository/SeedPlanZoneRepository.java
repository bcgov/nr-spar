package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.SeedPlanZone;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** This class holds methods for retrieving {@link SeedPlanZone} data from the database. */
public interface SeedPlanZoneRepository extends JpaRepository<SeedPlanZone, Integer> {

  List<SeedPlanZone> findAllByGeneticClassCode_AndVegetationCode_id(
      Character genClassCode, String vegCode);
}
