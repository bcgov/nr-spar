package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.TestedPtAreaOfUseSpz;
import ca.bc.gov.backendstartapi.entity.idclass.TestedPtAreaOfUseSpzId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** This class holds methods for retrieving {@link TestedPtAreaOfUseSpz} data from the database. */
public interface TestedPtAreaOfUseSpzRepository
    extends JpaRepository<TestedPtAreaOfUseSpz, TestedPtAreaOfUseSpzId> {
  List<TestedPtAreaOfUseSpz> findAllByTestedPtAreaOfUse_testedPtAreaOfUseId(
      Integer testedPtAreaOfUseId);

  @Query("SELECT DISTINCT t.seedPlanZoneCode.spzCode FROM TestedPtAreaOfUseSpz t")
  List<String> findAllDistinctSpz();
}
