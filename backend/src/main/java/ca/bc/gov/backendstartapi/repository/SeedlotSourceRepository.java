package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.SeedlotSourceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/** Repository for {@link SeedlotSourceEntity}. */
public interface SeedlotSourceRepository extends JpaRepository<SeedlotSourceEntity, String> {}
