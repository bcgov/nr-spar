package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.SeedlotSeedPlanZoneEntity;
import ca.bc.gov.backendstartapi.entity.seedlot.idclass.SeedlotSeedPlanZoneId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** This interface holds methods for handling {@link SeedlotSeedPlanZoneEntity} in the database. */
public interface SeedlotSeedPlanZoneRepository
    extends JpaRepository<SeedlotSeedPlanZoneEntity, SeedlotSeedPlanZoneId> {

  List<SeedlotSeedPlanZoneEntity> findAllBySeedlot_id(String seedlotNumber);
}
