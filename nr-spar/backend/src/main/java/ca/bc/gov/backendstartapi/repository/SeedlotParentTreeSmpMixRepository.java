package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeSmpMix;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeSmpMixId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** Repository for {@link SeedlotParentTreeSmpMix SeedlotParentTreeSMPMixes}. */
public interface SeedlotParentTreeSmpMixRepository
    extends JpaRepository<SeedlotParentTreeSmpMix, SeedlotParentTreeSmpMixId> {

  List<SeedlotParentTreeSmpMix> findAllBySeedlotParentTree_Seedlot_id(String seedlotNumber);
}
