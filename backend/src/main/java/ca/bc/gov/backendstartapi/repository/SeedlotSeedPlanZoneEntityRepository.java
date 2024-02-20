package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.SeedlotSeedPlanZoneEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.idclass.SeedlotSeedPlanZoneId;
import org.springframework.data.jpa.repository.JpaRepository;

/** This interface holds methods for handling {@link SeedlotSeedPlanZoneEntity} in the database. */
public interface SeedlotSeedPlanZoneEntityRepository
    extends JpaRepository<SeedlotSeedPlanZoneEntity, SeedlotSeedPlanZoneId> {}
