package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.SaveSeedlotProgressEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** Repository for {@link SaveSeedlotProgressEntity} (shared wizard-draft table). */
public interface SaveSeedlotProgressRepository
    extends JpaRepository<SaveSeedlotProgressEntity, String> {

  @Query(
      value =
          "SELECT sr.progress_status FROM spar.seedlot_registration_save sr"
              + " WHERE sr.seedlot_number = ?1",
      nativeQuery = true)
  Optional<Object> getStatusById(String seedlotNumber);
}
