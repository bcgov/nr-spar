package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.SeedPlanZoneCode;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** This class holds methods for retrieving {@link SeedPlanZoneCode} data from the database. */
public interface SeedPlanZoneCodeRepository extends JpaRepository<SeedPlanZoneCode, String> {

  @Query(
      """
      SELECT spzCode FROM SeedPlanZoneCode spzCode
      WHERE spzCode.spzCode IN :spzCodeList
        AND CURRENT_DATE >= spzCode.effectiveDate
        AND (spzCode.expiryDate IS NULL OR CURRENT_DATE < spzCode.expiryDate)
      ORDER BY spzCode.spzCode
      """)
  List<SeedPlanZoneCode> findAllValidBySpzCodeIn(@Param("spzCodeList") List<String> spzCodeList);

  /**
   * Whether a seed plan zone is coastal, as the legacy {@code SPR_GET_SPZ_TYPE} function decides
   * it: the zone is listed in {@code CODE_SUBSET_TBL} under {@code COASTAL_ZONE_ST}.
   *
   * <p>Native query reading only the two columns the legacy function uses. Like the legacy
   *
   * @param spzCode seed plan zone code, matched exactly
   * @return 1 when the zone is coastal; 0 for interior or unknown zones
   */
  @Query(
      value =
          """
          SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
          FROM CODE_SUBSET_TBL
          WHERE CODE_SUBSET_NAME = 'COASTAL_ZONE_ST'
            AND CODE_ARGUMENT = :spzCode
          """,
      nativeQuery = true)
  int isCoastalZone(@Param("spzCode") String spzCode);
}
