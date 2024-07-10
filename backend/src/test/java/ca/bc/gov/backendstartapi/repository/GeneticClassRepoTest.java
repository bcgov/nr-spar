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
@DisplayName("Repository Test | GeneticClass")
class GeneticClassRepoTest extends AbstractTestContainerIntegrationTest {
  @Autowired private GeneticClassRepository geneticClassRepository;

  @Test
  @DisplayName("testFindAllGeneticClass")
  void testFindAllGeneticClass() {
    var allTestObj = geneticClassRepository.findAll();
    assertEquals(2, allTestObj.size());
  }

  @Test
  @DisplayName("testFindGeneticClassById")
  void testFindGeneticClassById() {
    var testCode = "A";
    var testObj = geneticClassRepository.findById(testCode);
    assertTrue(testObj.isPresent());
    assertEquals(testCode, testObj.get().getGeneticClassCode());
    assertEquals("Orchard Seed or Cuttings", testObj.get().getDescription());
  }
}
