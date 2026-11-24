package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.SeedPlanZone;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** This class holds methods for retrieving {@link SeedPlanZone} data from the database. */
public interface SeedPlanZoneRepository extends JpaRepository<SeedPlanZone, Integer> {

  /**
   * Find the seed plan zones of a genetic class that apply to a species. A zone with no
   * vegetation code applies to every species of that class, matching the legacy SPAR rule.
   *
   * @param geneticClass the genetic class code, 'A' or 'B'
   * @param vegCode the vegetation code
   * @return the matching {@link SeedPlanZone} rows
   */
  @Query(
      """
      SELECT spz FROM SeedPlanZone spz
      LEFT JOIN spz.vegetationCode veg
      WHERE spz.geneticClassCode = :geneticClass
        AND (veg.id = :vegCode OR veg IS NULL)
      """)
  List<SeedPlanZone> findForSpeciesOrAllSpecies(
      @Param("geneticClass") Character geneticClass, @Param("vegCode") String vegCode);
}
