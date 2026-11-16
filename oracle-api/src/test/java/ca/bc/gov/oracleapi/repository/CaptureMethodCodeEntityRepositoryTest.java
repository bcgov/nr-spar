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
class CaptureMethodCodeEntityRepositoryTest {

  @Autowired private CaptureMethodRepository captureMethodRepository;

  private boolean isValid(CodeDescriptionDto dto) {
    LocalDate today = LocalDate.now();

    if (dto.effectiveDate().isAfter(today)) {
      return false;
    }

    return dto.expiryDate().isAfter(today);
  }

  @Test
  @DisplayName("findAllTest")
  @Sql(scripts = {"classpath:scripts/CaptureMethodRepositoryTest_findAllTest.sql"})
  void findAllTest() {
    List<CodeDescriptionDto> methods = captureMethodRepository.findAllValid();

    Assertions.assertFalse(methods.isEmpty());
    Assertions.assertEquals(2, methods.size());

    CodeDescriptionDto gps = methods.get(0);
    Assertions.assertEquals("GPS", gps.code());
    Assertions.assertEquals("GPS", gps.description());
    Assertions.assertTrue(isValid(gps));

    CodeDescriptionDto map = methods.get(1);
    Assertions.assertEquals("MAP", map.code());
    Assertions.assertEquals("Map", map.description());
    Assertions.assertTrue(isValid(map));
  }
}
