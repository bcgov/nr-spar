package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.FacilityTypes;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** This interface enables the funding source entity to be retrieved from the database. */
public interface FacilityTypesRepository extends JpaRepository<FacilityTypes, String> {

  @Query(
      value =
          "select ft from FacilityType ft WHERE CURRENT_DATE >= ft.effectiveDate "
              + "AND CURRENT_DATE < ft.expiryDate ORDER BY ft.code")
  List<FacilityTypes> findAllValid();
}
