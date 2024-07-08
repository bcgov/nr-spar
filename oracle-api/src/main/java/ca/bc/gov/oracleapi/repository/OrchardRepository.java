package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.OrchardEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** This repository class contains methods to retrieve Orchards from the database. */
public interface OrchardRepository extends JpaRepository<OrchardEntity, String> {

  @Query("from OrchardEntity o where o.stageCode <> 'RET' and o.id = ?1")
  Optional<OrchardEntity> findNotRetiredById(String id);

  // Find all orchards with a given vegCode
  List<OrchardEntity> findAllByVegetationCode(String vegCode);
}
