package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/** Repository for {@link SeedlotStatusEntity}. */
public interface SeedlotStatusRepository extends JpaRepository<SeedlotStatusEntity, String> {}
