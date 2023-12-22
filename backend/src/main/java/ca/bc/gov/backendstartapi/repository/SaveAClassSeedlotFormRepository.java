package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.SaveAClassSeedlotEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/** Repository for {@link SaveAClassSeedlotEntity}. */
public interface SaveAClassSeedlotFormRepository
    extends JpaRepository<SaveAClassSeedlotEntity, String> {}
