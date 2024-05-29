package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.OrchardEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** This repository class contains methods to retrieve Orchards from the database. */
public interface OrchardRepository extends JpaRepository<OrchardEntity, String> {

  @Query("from OrchardEntity o where o.stageCode <> 'RET' and o.id = ?1")
  Optional<OrchardEntity> findNotRetiredById(String id);

  // Find all orchards that are not retired with a given vegCode
  List<OrchardEntity> findAllByVegetationCodeAndStageCodeNot(String vegCode, String stageCode);
}
