package ca.bc.gov.backendstartapi.repository;

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
@Sql(scripts = {"classpath:sql_scripts/GeneticClassRepoTest.sql"})
class GeneticClassRepoTest {
  @Autowired private GeneticClassRepository geneticClassRepository;

  @Test
  @DisplayName("testFindAllGameticMethodologies")
  void testFindAll() {
    var allTestObj = geneticClassRepository.findAll();
    assertEquals(2, allTestObj.size());
  }
}
