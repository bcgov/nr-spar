package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.SeedCoastAreaCodeEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** This interface enables the seed coast area entity to be retrieved from the database. */
public interface SeedCoastAreaRepository extends JpaRepository<SeedCoastAreaCodeEntity, String> {

  @Query(
      value =
          "select sca from SeedCoastAreaCodeEntity sca WHERE CURRENT_DATE >= sca.effectiveDate "
              + "AND CURRENT_DATE < sca.expiryDate ORDER BY sca.code")
  List<SeedCoastAreaCodeEntity> findAllValid();
}
