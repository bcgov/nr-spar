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
class NumberTreesCollectedCodeEntityRepositoryTest {

  @Autowired private NumberTreesCollectedCodeRepository numberTreesCollectedCodeRepository;

  private boolean isValid(CodeDescriptionDto dto) {
    LocalDate today = LocalDate.now();

    if (dto.effectiveDate().isAfter(today)) {
      return false;
    }

    return dto.expiryDate().isAfter(today);
  }

  @Test
  @DisplayName("findAllTest")
  @Sql(scripts = {"classpath:scripts/NumberTreesCollectedRepositoryTest_findAllTest.sql"})
  void findAllTest() {
    List<CodeDescriptionDto> codes = numberTreesCollectedCodeRepository.findAllValid();

    Assertions.assertFalse(codes.isEmpty());
    Assertions.assertEquals(2, codes.size());

    CodeDescriptionDto code1 = codes.get(0);
    Assertions.assertEquals("1", code1.code());
    Assertions.assertEquals("1 to 10 trees", code1.description());
    Assertions.assertTrue(isValid(code1));

    CodeDescriptionDto code2 = codes.get(1);
    Assertions.assertEquals("2", code2.code());
    Assertions.assertEquals("11 to 50 trees", code2.description());
    Assertions.assertTrue(isValid(code2));
  }
}
