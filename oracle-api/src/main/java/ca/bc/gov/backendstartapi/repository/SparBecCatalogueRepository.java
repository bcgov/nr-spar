package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.SparBecCatalogueEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** This interface enables the funding source entity to be retrieved from the database. */
public interface SparBecCatalogueRepository extends JpaRepository<SparBecCatalogueEntity, String> {
  List<SparBecCatalogueEntity> findAllByBecCodeOrderByUpdateTimeStampDesc(String becCode);
}
