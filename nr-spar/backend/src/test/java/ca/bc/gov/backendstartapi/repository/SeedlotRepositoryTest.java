package ca.bc.gov.backendstartapi.repository;

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
@Sql(scripts = {"classpath:sql_scripts/SeedlotRepositoryTest.sql"})
class SeedlotRepositoryTest {

  @Autowired private SeedlotRepository seedlotRepository;

  @Test
  @DisplayName("findNextSeedlotNumberTest")
  void findNextSeedlotNumberTest() {
    Integer nextNumberA = seedlotRepository.findNextSeedlotNumber(63000, 65000);
    Assertions.assertNotNull(nextNumberA);
    Assertions.assertEquals(63000, nextNumberA);
  }
}
