package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.SaveSeedlotProgressEntityClassA;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** Repository for {@link SaveSeedlotProgressEntityClassA}. */
public interface SaveSeedlotProgressRepositoryClassA
    extends JpaRepository<SaveSeedlotProgressEntityClassA, String> {
  public static final String GET_STATUS_BY_ID =
      "SELECT sr.progress_status FROM spar.seedlot_registration_a_class_save sr WHERE"
          + " sr.seedlot_number = ?1";

  @Query(value = GET_STATUS_BY_ID, nativeQuery = true)
  public Optional<Object> getStatusById(String seedlotNumber);
}
