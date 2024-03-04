package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.SeedPlanUnit;
import org.springframework.data.jpa.repository.JpaRepository;

/** This class holds methods for retrieving {@link SeedPlanUnit} data from the database. */
public interface SeedPlanUnitRepository extends JpaRepository<SeedPlanUnit, Integer> {}
