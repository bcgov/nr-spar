package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.SeedPlanUnit;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** This class holds methods for retrieving {@link SeedPlanUnit} data from the database. */
public interface SeedPlanUnitRepository extends JpaRepository<SeedPlanUnit, Integer> {

  List<SeedPlanUnit> findBySeedPlanUnitIdIn(List<Integer> spuIds);
}
