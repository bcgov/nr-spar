package ca.bc.gov.oracleapi.repository.spar;

import ca.bc.gov.oracleapi.entity.spar.ParentTreeSpuEntity;
import ca.bc.gov.oracleapi.entity.spar.idclass.ParentTreeSpuId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** This class holds methods for retrieving {@link ParentTreeSpuEntity} data from the database. */
public interface ParentTreeSpuRepository
    extends JpaRepository<ParentTreeSpuEntity, ParentTreeSpuId> {

  List<ParentTreeSpuEntity> findByIdSpuIdIn(List<Integer> spuId);
}
