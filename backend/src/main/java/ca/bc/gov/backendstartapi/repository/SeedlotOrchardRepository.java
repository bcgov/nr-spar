package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOrchard;
import ca.bc.gov.backendstartapi.entity.seedlot.idclass.SeedlotOrchardId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** The repository for {@link SeedlotOrchard SeedlotOrchards}. */
public interface SeedlotOrchardRepository extends JpaRepository<SeedlotOrchard, SeedlotOrchardId> {

  List<SeedlotOrchard> findAllBySeelot_id(String seedlotNumber);
}
