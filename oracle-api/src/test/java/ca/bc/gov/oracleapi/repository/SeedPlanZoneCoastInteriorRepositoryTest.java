package ca.bc.gov.oracleapi.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.jdbc.Sql;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
@Sql(scripts = {"classpath:scripts/SeedPlanZoneCoastInteriorTest.sql"})
class SeedPlanZoneCoastInteriorRepositoryTest {

  @Autowired private SeedPlanZoneCodeRepository seedPlanZoneCodeRepository;

  @Test
  @DisplayName("Zones listed under COASTAL_ZONE_ST are coastal")
  void isCoastalZone_listed() {
    assertEquals(1, seedPlanZoneCodeRepository.isCoastalZone("M"));
    assertEquals(1, seedPlanZoneCodeRepository.isCoastalZone("SM"));
  }

  @Test
  @DisplayName("Zones only in another subset, or not listed at all, are not coastal")
  void isCoastalZone_notListed() {
    assertEquals(0, seedPlanZoneCodeRepository.isCoastalZone("EK"));
    assertEquals(0, seedPlanZoneCodeRepository.isCoastalZone("XX"));
  }

  @Test
  @DisplayName("Match is exact, as in the legacy function")
  void isCoastalZone_exactMatch() {
    assertEquals(0, seedPlanZoneCodeRepository.isCoastalZone("m"));
  }
}
