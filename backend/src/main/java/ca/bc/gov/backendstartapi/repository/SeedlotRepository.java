package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;

import java.util.List;

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
   * Paginated search for seedlots by the user who registered it.
   *
   * @param userID a string wih the user id
   * @param pageable an object with the pagination and sorting information
   * @return a list with the seedlots with the specific pagination size
   */
  List<Seedlot> findAllByAuditInformation_EntryUserId(String userID, Pageable pageable);
}
