package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.TestedPtAreaOfUse;
import ca.bc.gov.oracleapi.entity.TestedPtAreaOfUseSpu;
import ca.bc.gov.oracleapi.entity.idclass.TestedPtAreaOfUseSpuId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** This class holds methods for retrieving {@link TestedPtAreaOfUse} data from the database. */
public interface TestedPtAreaOfUseSpuRepository
    extends JpaRepository<TestedPtAreaOfUseSpu, TestedPtAreaOfUseSpuId> {

  List<TestedPtAreaOfUseSpu> findByTestedPtAreaOfUseId(Integer testedPtAreaOfUseId);
}
