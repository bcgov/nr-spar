package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.SeedPlanZone;
import org.springframework.data.jpa.repository.JpaRepository;

/** This class holds methods for retrieving {@link SeedPlanZone} data from the database. */
public interface SeedPlanZoneRepository extends JpaRepository<SeedPlanZone, Integer> {}
