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
}
