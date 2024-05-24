package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.ParentTreeSpuEntity;
import ca.bc.gov.backendstartapi.entity.idclass.ParentTreeSpuId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** This class holds methods for retrieving {@link ParentTreeSpuEntity} data from the database. */
public interface ParentTreeSpuRepository
    extends JpaRepository<ParentTreeSpuEntity, ParentTreeSpuId> {

  List<ParentTreeSpuEntity> findByIdSpuIdIn(List<Integer> spuId);
}
