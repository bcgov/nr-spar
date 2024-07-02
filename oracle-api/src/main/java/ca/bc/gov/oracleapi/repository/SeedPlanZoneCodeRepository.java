package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.SeedPlanZoneCode;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** This class holds methods for retrieving {@link SeedPlanZoneCode} data from the database. */
public interface SeedPlanZoneCodeRepository extends JpaRepository<SeedPlanZoneCode, String> {

  List<SeedPlanZoneCode> findBySpzCodeIn(List<String> spzCodeList);
}
