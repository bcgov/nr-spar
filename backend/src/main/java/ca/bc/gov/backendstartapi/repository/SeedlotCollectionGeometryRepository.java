package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionGeometry;
import org.springframework.data.jpa.repository.JpaRepository;

/** Repository for {@link SeedlotCollectionGeometry}. */
public interface SeedlotCollectionGeometryRepository
    extends JpaRepository<SeedlotCollectionGeometry, String> {}
