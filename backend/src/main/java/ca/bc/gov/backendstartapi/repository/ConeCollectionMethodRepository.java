package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** Repository for {@link ConeCollectionMethodEntity}. */
public interface ConeCollectionMethodRepository
    extends JpaRepository<ConeCollectionMethodEntity, Integer> {

  List<ConeCollectionMethodEntity> findAllByConeCollectionMethodCodeIn(List<Integer> ids);
}
