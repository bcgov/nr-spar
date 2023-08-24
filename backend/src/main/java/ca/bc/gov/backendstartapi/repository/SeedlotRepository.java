package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** The repository for {@link Seedlot Seedlots}. */
public interface SeedlotRepository extends JpaRepository<Seedlot, String> {

  @Query(
      """
      select MAX(TO_NUMBER(s.SEEDLOT_NUMBER))
      from THE.SEEDLOT s
      WHERE s.SEEDLOT_NUMBER
        BETWEEN ?1 AND ?2
      """)
  String findNextSeedlotNumber(Long min, Long max);
}
