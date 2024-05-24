package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.SeedPlanZoneCode;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** This class holds methods for retrieving {@link SeedPlanZoneCode} data from the database. */
public interface SeedPlanZoneCodeRepository extends JpaRepository<SeedPlanZoneCode, String> {

  List<SeedPlanZoneCode> findBySpzCodeIn(List<String> spzCodeList);
}
