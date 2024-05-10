package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.TestedPtAreaOfUse;
import ca.bc.gov.backendstartapi.entity.TestedPtAreaOfUseSpu;
import ca.bc.gov.backendstartapi.entity.idclass.TestedPtAreaOfUseSpuId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** This class holds methods for retrieving {@link TestedPtAreaOfUse} data from the database. */
public interface TestedPtAreaOfUseSpuRepository
    extends JpaRepository<TestedPtAreaOfUseSpu, TestedPtAreaOfUseSpuId> {

  List<TestedPtAreaOfUseSpu> findByTestedPtAreaOfUseId(Integer testedPtAreaOfUseId);
}
