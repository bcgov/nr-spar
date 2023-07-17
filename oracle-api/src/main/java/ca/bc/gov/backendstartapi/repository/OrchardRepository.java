package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.Orchard;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** This repository class contains methods to retrieve Orchards from the database. */
public interface OrchardRepository extends JpaRepository<Orchard, String> {

  @Query("from Orchard o where o.stageCode <> 'RET' and o.id = ?1")
  Optional<Orchard> findNotRetiredById(String id);

  // Find all orchards that are not retired with a given vegCode
  List<Orchard> findAllByVegetationCodeAndStageCodeNot(String vegCode, String stageCode);
}
