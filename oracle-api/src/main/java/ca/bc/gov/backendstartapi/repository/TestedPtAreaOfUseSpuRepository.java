package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.TestedPtAreaOfUseSpu;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** This class holds methods for retrieving {@link TestedPtAreaOfUseSpu} data from the database. */
public interface TestedPtAreaOfUseSpuRepository
    extends JpaRepository<TestedPtAreaOfUseSpu, Integer> {

  Optional<TestedPtAreaOfUseSpu> findByTestedPtAreaOfUseIdAndSeedPlanUnitId(
      Integer testedPtAreaOfUseId, Integer seedPlanUnitId);
}
