package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.SeedlotGeneticWorth;
import ca.bc.gov.backendstartapi.entity.idclass.SeedlotGeneticWorthId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** Repository for {@link SeedlotGeneticWorth SeedlotGeneticWorth}. */
public interface SeedlotGeneticWorthRepository
    extends JpaRepository<SeedlotGeneticWorth, SeedlotGeneticWorthId> {

  List<SeedlotGeneticWorth> findAllBySeedlot_id(String seedlotNumber);
}
