package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.TestedPtAreaOfUseSpz;
import ca.bc.gov.oracleapi.entity.idclass.TestedPtAreaOfUseSpzId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** This class holds methods for retrieving {@link TestedPtAreaOfUseSpz} data from the database. */
public interface TestedPtAreaOfUseSpzRepository
    extends JpaRepository<TestedPtAreaOfUseSpz, TestedPtAreaOfUseSpzId> {

  List<TestedPtAreaOfUseSpz> findAllByTestedPtAreaOfUse_testedPtAreaOfUseId(
      Integer testedPtAreaOfUseId);
}
