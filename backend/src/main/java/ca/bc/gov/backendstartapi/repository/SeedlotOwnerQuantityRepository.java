package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOwnerQuantity;
import ca.bc.gov.backendstartapi.entity.seedlot.idclass.SeedlotOwnerQuantityId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** The repository for {@link SeedlotOwnerQuantity SeedlotOwnerQuantities}. */
public interface SeedlotOwnerQuantityRepository
    extends JpaRepository<SeedlotOwnerQuantity, SeedlotOwnerQuantityId> {

  List<SeedlotOwnerQuantity> findAllBySeedlot_id(String seedlotNumber);

  void deleteAllBySeedlot_id(String seedlotNumber);
}
