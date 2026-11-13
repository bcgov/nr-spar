package ca.bc.gov.oracleapi.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import ca.bc.gov.oracleapi.entity.SeedPlanZone;
import ca.bc.gov.oracleapi.entity.SeedPlanZoneCode;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.jdbc.Sql;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
@Sql(scripts = {"classpath:scripts/SeedPlanZoneRepositoryTest.sql"})
class SeedPlanZoneRepositoryTest {

  @Autowired private SeedPlanZoneRepository seedPlanZoneRepository;

  @Autowired private SeedPlanZoneCodeRepository seedPlanZoneCodeRepository;

  private List<String> spzCodes(List<SeedPlanZone> zones) {
    return zones.stream().map(spz -> spz.getSeedPlanZoneCode().getSpzCode()).sorted().toList();
  }

  @Test
  @DisplayName("Zones with no species apply to every species of the class")
  void findForSpeciesOrAllSpecies_includesZonesWithNoSpecies() {
    List<SeedPlanZone> zones = seedPlanZoneRepository.findForSpeciesOrAllSpecies('B', "FDC");

    assertEquals(List.of("M", "OLD", "SM"), spzCodes(zones));
  }

  @Test
  @DisplayName("Zones for another species or class are excluded")
  void findForSpeciesOrAllSpecies_excludesOtherSpeciesAndClasses() {
    assertEquals(
        List.of("BV", "M", "OLD"),
        spzCodes(seedPlanZoneRepository.findForSpeciesOrAllSpecies('B', "PLI")));
    assertEquals(
        List.of("GL"), spzCodes(seedPlanZoneRepository.findForSpeciesOrAllSpecies('A', "FDC")));
  }

  @Test
  @DisplayName("Expired zone codes are left out")
  void findAllValidBySpzCodeIn_excludesExpiredCodes() {
    List<SeedPlanZoneCode> codes =
        seedPlanZoneCodeRepository.findAllValidBySpzCodeIn(List.of("M", "OLD", "SM"));

    assertEquals(List.of("M", "SM"), codes.stream().map(SeedPlanZoneCode::getSpzCode).toList());
  }

  @Test
  @DisplayName("A zone code with no expiry date stays valid")
  void findAllValidBySpzCodeIn_keepsCodesWithNoExpiry() {
    List<SeedPlanZoneCode> codes =
        seedPlanZoneCodeRepository.findAllValidBySpzCodeIn(List.of("OPEN"));

    assertEquals(List.of("OPEN"), codes.stream().map(SeedPlanZoneCode::getSpzCode).toList());
  }
}
