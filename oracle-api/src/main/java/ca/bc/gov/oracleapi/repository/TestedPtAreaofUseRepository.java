package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.TestedPtAreaOfUse;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** This class holds methods for retrieving {@link TestedPtAreaOfUse} data from the database. */
public interface TestedPtAreaofUseRepository extends JpaRepository<TestedPtAreaOfUse, Integer> {

  List<TestedPtAreaOfUse> findAllBySeedPlanUnitIdIn(List<Integer> spuIds);

  List<TestedPtAreaOfUse> findAllBySeedPlanUnitId(Integer spuId);
}
