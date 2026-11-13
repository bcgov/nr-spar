package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.dto.OrgUnitDto;
import ca.bc.gov.oracleapi.entity.OrgUnitEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** Repository for district-level org units from the Oracle ORG_UNIT table. */
public interface OrgUnitRepository extends JpaRepository<OrgUnitEntity, Integer> {

  /**
   * Returns all valid district org units.
   *
   * <p>Districts are identified by {@code ORG_UNIT_NO = ROLLUP_DIST_NO} (the unit rolls up to
   * itself). Only non-expired, already-effective records are returned.
   */
  @Query(
      """
      SELECT new ca.bc.gov.oracleapi.dto.OrgUnitDto(
        o.orgUnitNo, o.orgUnitCode, o.orgUnitName, o.rollupDistNo, o.effectiveDate, o.expiryDate)
      FROM OrgUnitEntity o
      WHERE o.orgUnitNo = o.rollupDistNo
        AND CURRENT_DATE >= o.effectiveDate
        AND CURRENT_DATE < o.expiryDate
      ORDER BY o.orgUnitCode
      """)
  List<OrgUnitDto> findAllDistricts();
}
