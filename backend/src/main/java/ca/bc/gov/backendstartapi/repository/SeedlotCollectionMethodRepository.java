package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionMethod;
import ca.bc.gov.backendstartapi.entity.seedlot.idclass.SeedlotCollectionMethodId;
import org.springframework.data.jpa.repository.JpaRepository;

/** The repository for {@link SeedlotCollectionMethod}. */
public interface SeedlotCollectionMethodRepository
    extends JpaRepository<SeedlotCollectionMethod, SeedlotCollectionMethodId> {}
