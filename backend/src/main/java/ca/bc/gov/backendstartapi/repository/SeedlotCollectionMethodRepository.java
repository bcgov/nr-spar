package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotCollectionMethod;
import ca.bc.gov.backendstartapi.entity.seedlot.idclass.SeedlotCollectionMethodId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** The repository for {@link SeedlotCollectionMethod}. */
public interface SeedlotCollectionMethodRepository
    extends JpaRepository<SeedlotCollectionMethod, SeedlotCollectionMethodId> {

  List<SeedlotCollectionMethod> findAllBySeedlot_id(String seedlotNumber);

  void deleteAllBySeedlot_id(String seedlotNumber);
}
