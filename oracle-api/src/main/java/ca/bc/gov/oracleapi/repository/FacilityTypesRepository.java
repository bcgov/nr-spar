package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.FacilityTypes;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** This interface enables the facility type entity to be retrieved from the database. */
public interface FacilityTypesRepository extends JpaRepository<FacilityTypes, String> {

  @Query(
      value =
          "select ft from FacilityTypes ft WHERE CURRENT_DATE >= ft.effectiveDate "
              + "AND CURRENT_DATE < ft.expiryDate ORDER BY ft.code")
  List<FacilityTypes> findAllValid();
}
