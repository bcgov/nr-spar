package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.SeedPlanUnit;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** This class holds methods for retrieving {@link SeedPlanUnit} data from the database. */
public interface SeedPlanUnitRepository extends JpaRepository<SeedPlanUnit, Integer> {

  List<SeedPlanUnit> findBySeedPlanUnitIdIn(List<Integer> spuIds);
}
