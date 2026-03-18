package ca.bc.gov.oracleapi.repository.spar;

import ca.bc.gov.oracleapi.entity.spar.TestedPtAreaOfUseSpz;
import ca.bc.gov.oracleapi.entity.spar.idclass.TestedPtAreaOfUseSpzId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** This class holds methods for retrieving {@link TestedPtAreaOfUseSpz} data from the database. */
public interface TestedPtAreaOfUseSpzRepository
    extends JpaRepository<TestedPtAreaOfUseSpz, TestedPtAreaOfUseSpzId> {

  List<TestedPtAreaOfUseSpz> findAllByTestedPtAreaOfUse_testedPtAreaOfUseId(
      Integer testedPtAreaOfUseId);
}
