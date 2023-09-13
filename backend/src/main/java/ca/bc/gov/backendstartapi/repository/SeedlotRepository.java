package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
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
}
