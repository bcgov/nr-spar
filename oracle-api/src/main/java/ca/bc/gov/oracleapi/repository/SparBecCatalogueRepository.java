package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.dto.SparBecZoneDescriptionDto;
import ca.bc.gov.oracleapi.entity.SparBecCatalogueEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** This interface enables the funding source entity to be retrieved from the database. */
public interface SparBecCatalogueRepository extends JpaRepository<SparBecCatalogueEntity, String> {

  @Query(
      value =
          """
          SELECT sbc.BEC_ZONE_CODE AS becZoneCode
            ,sbc.ZONE_NAME AS becZoneName
            ,MAX(sbc.UPDATE_TIMESTAMP) AS bacZoneUpdateTimestamp
          FROM THE.SPAR_BIOGEOCLIMATIC_CATALOGUE sbc
          WHERE sbc.BEC_ZONE_CODE IN ?1
            AND sbc.EXPIRY_DATE > CURRENT_TIMESTAMP
          GROUP BY sbc.BEC_ZONE_CODE
            ,sbc.ZONE_NAME
      """,
      nativeQuery = true)
  List<SparBecZoneDescriptionDto> findAllBecZonesByCodeIn(List<String> becCodes);
}
