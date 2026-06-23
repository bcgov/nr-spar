package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.NumberTreesCollectedCodeEntity;
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
class NumberTreesCollectedCodeEntityRepositoryTest {

  @Autowired private NumberTreesCollectedCodeRepository numberTreesCollectedCodeRepository;

  private boolean isValid(NumberTreesCollectedCodeEntity numberTreesCollectedCodeEntity) {
    LocalDate today = LocalDate.now();

    if (numberTreesCollectedCodeEntity.getEffectiveDate().isAfter(today)) {
      return false;
    }

    return numberTreesCollectedCodeEntity.getExpiryDate().isAfter(today);
  }

  @Test
  @DisplayName("findAllTest")
  @Sql(scripts = {"classpath:scripts/NumberTreesCollectedRepositoryTest_findAllTest.sql"})
  void findAllTest() {
    List<NumberTreesCollectedCodeEntity> codes = numberTreesCollectedCodeRepository.findAllValid();

    Assertions.assertFalse(codes.isEmpty());
    Assertions.assertEquals(2, codes.size());

    NumberTreesCollectedCodeEntity code1 = codes.get(0);
    Assertions.assertEquals("1", code1.getCode());
    Assertions.assertEquals("1 to 10 trees", code1.getDescription());
    Assertions.assertTrue(isValid(code1));

    NumberTreesCollectedCodeEntity code2 = codes.get(1);
    Assertions.assertEquals("2", code2.getCode());
    Assertions.assertEquals("11 to 50 trees", code2.getDescription());
    Assertions.assertTrue(isValid(code2));
  }
}
