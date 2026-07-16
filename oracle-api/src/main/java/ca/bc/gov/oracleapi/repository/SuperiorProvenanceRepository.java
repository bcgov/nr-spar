package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.SuperiorProvenanceEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Repository for {@link SuperiorProvenanceEntity}. */
public interface SuperiorProvenanceRepository
    extends JpaRepository<SuperiorProvenanceEntity, Integer> {

  @Query(
      value =
          "select sp from SuperiorProvenanceEntity sp WHERE sp.vegetationCode = :vegetationCode "
              + "AND CURRENT_DATE >= sp.effectiveDate AND CURRENT_DATE < sp.expiryDate "
              + "ORDER BY sp.provenanceDescription")
  List<SuperiorProvenanceEntity> findValidByVegetationCode(
      @Param("vegetationCode") String vegetationCode);
}
