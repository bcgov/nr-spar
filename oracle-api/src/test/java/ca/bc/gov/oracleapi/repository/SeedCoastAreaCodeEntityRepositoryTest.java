package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.dto.CodeDescriptionDto;
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

  private boolean isValid(CodeDescriptionDto dto) {
    LocalDate today = LocalDate.now();

    if (dto.effectiveDate().isAfter(today)) {
      return false;
    }

    return dto.expiryDate().isAfter(today);
  }

  @Test
  @DisplayName("findAllTest")
  @Sql(scripts = {"classpath:scripts/SeedCoastAreaRepositoryTest_findAllTest.sql"})
  void findAllTest() {
    List<CodeDescriptionDto> areas = seedCoastAreaRepository.findAllValid();

    Assertions.assertFalse(areas.isEmpty());
    Assertions.assertEquals(2, areas.size());

    CodeDescriptionDto north = areas.get(0);
    Assertions.assertEquals("N", north.code());
    Assertions.assertEquals("North Coast", north.description());
    Assertions.assertTrue(isValid(north));

    CodeDescriptionDto south = areas.get(1);
    Assertions.assertEquals("S", south.code());
    Assertions.assertEquals("South Coast", south.description());
    Assertions.assertTrue(isValid(south));
  }
}
