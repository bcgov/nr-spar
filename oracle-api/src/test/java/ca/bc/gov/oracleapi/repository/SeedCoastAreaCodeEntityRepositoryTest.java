package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.SeedCoastAreaCodeEntity;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.jdbc.Sql;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
class SeedCoastAreaCodeEntityRepositoryTest {

  @Autowired private SeedCoastAreaRepository seedCoastAreaRepository;

  private boolean isValid(SeedCoastAreaCodeEntity seedCoastAreaCodeEntity) {
    LocalDate today = LocalDate.now();

    if (seedCoastAreaCodeEntity.getEffectiveDate().isAfter(today)) {
      return false;
    }

    return seedCoastAreaCodeEntity.getExpiryDate().isAfter(today);
  }

  @Test
  @DisplayName("findAllTest")
  @Sql(scripts = {"classpath:scripts/SeedCoastAreaRepositoryTest_findAllTest.sql"})
  void findAllTest() {
    List<SeedCoastAreaCodeEntity> areas = seedCoastAreaRepository.findAllValid();

    Assertions.assertFalse(areas.isEmpty());
    Assertions.assertEquals(2, areas.size());

    SeedCoastAreaCodeEntity north = areas.get(0);
    Assertions.assertEquals("N", north.getCode());
    Assertions.assertEquals("North Coast", north.getDescription());
    Assertions.assertTrue(isValid(north));

    SeedCoastAreaCodeEntity south = areas.get(1);
    Assertions.assertEquals("S", south.getCode());
    Assertions.assertEquals("South Coast", south.getDescription());
    Assertions.assertTrue(isValid(south));
  }
}
