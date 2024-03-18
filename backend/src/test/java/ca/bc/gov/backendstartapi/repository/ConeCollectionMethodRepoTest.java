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
@Sql(scripts = {"classpath:sql_scripts/ConeCollectionMethodRepoTest.sql"})
class ConeCollectionMethodRepoTest {

  @Autowired private ConeCollectionMethodRepository coneCollectionMethodRepository;

  @Test
  @DisplayName("testFindAllConeCollectionMethod")
  void testFindAll() {
    var allTestObj = coneCollectionMethodRepository.findAll();
    assertEquals(8, allTestObj.size());
  }
}
