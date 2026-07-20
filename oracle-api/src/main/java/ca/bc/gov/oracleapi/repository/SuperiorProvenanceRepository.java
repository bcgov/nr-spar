package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.dto.SuperiorProvenanceDto;
import ca.bc.gov.oracleapi.entity.SuperiorProvenanceEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Repository for {@link SuperiorProvenanceEntity}. */
public interface SuperiorProvenanceRepository
    extends JpaRepository<SuperiorProvenanceEntity, Integer> {

  @Query(
      """
      SELECT new ca.bc.gov.oracleapi.dto.SuperiorProvenanceDto(
        sp.provenanceId, sp.vegetationCode, sp.provenanceDescription)
      FROM SuperiorProvenanceEntity sp
      WHERE sp.vegetationCode = :vegetationCode
        AND CURRENT_DATE >= sp.effectiveDate
        AND CURRENT_DATE < sp.expiryDate
      ORDER BY sp.provenanceDescription
      """)
  List<SuperiorProvenanceDto> findValidByVegetationCode(
      @Param("vegetationCode") String vegetationCode);
}
