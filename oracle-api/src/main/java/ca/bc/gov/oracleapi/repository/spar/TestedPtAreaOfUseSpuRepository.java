package ca.bc.gov.oracleapi.repository.spar;

import ca.bc.gov.oracleapi.entity.spar.TestedPtAreaOfUse;
import ca.bc.gov.oracleapi.entity.spar.TestedPtAreaOfUseSpu;
import ca.bc.gov.oracleapi.entity.spar.idclass.TestedPtAreaOfUseSpuId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** This class holds methods for retrieving {@link TestedPtAreaOfUse} data from the database. */
public interface TestedPtAreaOfUseSpuRepository
    extends JpaRepository<TestedPtAreaOfUseSpu, TestedPtAreaOfUseSpuId> {

  List<TestedPtAreaOfUseSpu> findByTestedPtAreaOfUseId(Integer testedPtAreaOfUseId);
}
