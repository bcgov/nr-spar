package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.SeedlotAClassSaveEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/** Repository for {@link SeedlotAClassSaveEntity}. */
public interface SeedlotAClassSaveRepository
    extends JpaRepository<SeedlotAClassSaveEntity, String> {}
