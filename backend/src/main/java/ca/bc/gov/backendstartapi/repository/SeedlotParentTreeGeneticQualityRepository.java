package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.SeedlotParentTreeGeneticQuality;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotParentTreeGeneticQualityId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** Repository for {@link SeedlotParentTreeGeneticQuality SeedlotParentTreeGeneticQualities}. */
public interface SeedlotParentTreeGeneticQualityRepository
    extends JpaRepository<SeedlotParentTreeGeneticQuality, SeedlotParentTreeGeneticQualityId> {

  List<SeedlotParentTreeGeneticQuality> findAllBySeedlotParentTree_Seedlot_id(String seedlotNumber);
}
