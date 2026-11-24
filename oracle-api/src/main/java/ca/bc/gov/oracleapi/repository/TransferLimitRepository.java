package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.TransferLimitEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Repository for {@link TransferLimitEntity}. */
public interface TransferLimitRepository extends JpaRepository<TransferLimitEntity, Long> {

  /**
   * Searches transfer limits. Every criterion is optional; a null criterion is not applied.
   *
   * <p>A null vegetation code, superior provenance flag or seed plan zone on a row means the
   * row applies to every value. With {@code includeNullMatches}, those rows also match a filter on
   * that column.
   *
   * <p>Rows with values sort before rows with nulls, so specific rows come first.
   */
  @Query(
      """
      SELECT tl FROM TransferLimitEntity tl
      WHERE (:vegetationCode IS NULL OR tl.vegetationCode = :vegetationCode
             OR (:includeNullMatches = TRUE AND tl.vegetationCode IS NULL))
        AND (:geneticClassCode IS NULL OR tl.geneticClassCode = :geneticClassCode)
        AND (:superiorProvenance IS NULL OR tl.superiorProvenance = :superiorProvenance
             OR (:includeNullMatches = TRUE AND tl.superiorProvenance IS NULL))
        AND (:coastInteriorCode IS NULL OR tl.coastInteriorCode = :coastInteriorCode)
        AND (:seedPlanZoneCode IS NULL OR tl.seedPlanZoneCode = :seedPlanZoneCode
             OR (:includeNullMatches = TRUE AND tl.seedPlanZoneCode IS NULL))
        AND (:latitudeDeg IS NULL
             OR :latitudeDeg BETWEEN tl.siteMinLatDeg AND tl.siteMaxLatDeg)
      ORDER BY tl.vegetationCode NULLS LAST, tl.seedPlanZoneCode NULLS LAST,
               tl.transferLimitSkey
      """)
  List<TransferLimitEntity> search(
      @Param("vegetationCode") String vegetationCode,
      @Param("geneticClassCode") String geneticClassCode,
      @Param("superiorProvenance") Boolean superiorProvenance,
      @Param("coastInteriorCode") String coastInteriorCode,
      @Param("seedPlanZoneCode") String seedPlanZoneCode,
      @Param("latitudeDeg") Integer latitudeDeg,
      @Param("includeNullMatches") boolean includeNullMatches);
}
