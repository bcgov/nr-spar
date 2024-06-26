package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** The repository for {@link Seedlot Seedlots}. */
public interface SeedlotRepository extends JpaRepository<Seedlot, String> {
  @Query(
      """
      select max(cast(s.id as int))
      from Seedlot s
      where cast(s.id as int) between ?1 and ?2
      """)
  Integer findNextSeedlotNumber(Integer min, Integer max);

  /**
   * Finds all {@link Seedlot} given an applicant client number in a paginated search.
   *
   * @param clientId applicant client number to fetch seedlots to
   * @param pageable the pagination and sorting specifications
   * @return A {@link List} of {@link Seedlot} populated or empty
   */
  Page<Seedlot> findAllByApplicantClientNumber(String clientId, Pageable pageable);
}
