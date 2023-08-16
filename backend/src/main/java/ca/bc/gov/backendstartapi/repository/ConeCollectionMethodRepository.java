package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/** Repository for {@link ConeCollectionMethodEntity}. */
public interface ConeCollectionMethodRepository
    extends JpaRepository<ConeCollectionMethodEntity, Integer> {}
