package ca.bc.gov.backendstartapi.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.backendstartapi.extension.AbstractTestContainerIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.jdbc.Sql;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
@DisplayName("Repository Test | GeneticWorth")
class GeneticWorthRepoTest extends AbstractTestContainerIntegrationTest {
  @Autowired private GeneticWorthRepository geneticWorthRepository;

  @Test
  @DisplayName("testFindAllGeneticWorth")
  void testFindAllGeneticWorth() {
    var allTestObj = geneticWorthRepository.findAll();
    assertEquals(16, allTestObj.size());
  }

  @Test
  @DisplayName("testFindGeneticWorthById")
  void testFindGeneticWorthById() {
    var testCode = "AD";
    var testObj = geneticWorthRepository.findById(testCode);
    assertTrue(testObj.isPresent());
    assertEquals(testCode, testObj.get().getGeneticWorthCode());
    assertEquals("Animal browse resistance (deer)", testObj.get().getDescription());
  }
}
