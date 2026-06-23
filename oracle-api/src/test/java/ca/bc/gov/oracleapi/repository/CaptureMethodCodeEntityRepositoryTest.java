package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.CaptureMethodCodeEntity;
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

  private boolean isValid(CaptureMethodCodeEntity captureMethodCodeEntity) {
    LocalDate today = LocalDate.now();

    if (captureMethodCodeEntity.getEffectiveDate().isAfter(today)) {
      return false;
    }

    return captureMethodCodeEntity.getExpiryDate().isAfter(today);
  }

  @Test
  @DisplayName("findAllTest")
  @Sql(scripts = {"classpath:scripts/CaptureMethodRepositoryTest_findAllTest.sql"})
  void findAllTest() {
    List<CaptureMethodCodeEntity> methods = captureMethodRepository.findAllValid();

    Assertions.assertFalse(methods.isEmpty());
    Assertions.assertEquals(2, methods.size());

    CaptureMethodCodeEntity gps = methods.get(0);
    Assertions.assertEquals("GPS", gps.getCode());
    Assertions.assertEquals("GPS", gps.getDescription());
    Assertions.assertTrue(isValid(gps));

    CaptureMethodCodeEntity map = methods.get(1);
    Assertions.assertEquals("MAP", map.getCode());
    Assertions.assertEquals("Map", map.getDescription());
    Assertions.assertTrue(isValid(map));
  }
}
