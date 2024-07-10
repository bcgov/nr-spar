package ca.bc.gov.backendstartapi.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

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
@DisplayName("Repository Test | MethodOfPayment")
class MethodOfPaymentRepoTest extends AbstractTestContainerIntegrationTest {
  @Autowired private MethodOfPaymentRepository methodOfPaymentRepository;

  @Test
  @DisplayName("findAllMethodOfPaymentRepoTest")
  void findAllMethodOfPaymentRepoTest() {
    var allTestObj = methodOfPaymentRepository.findAll();
    assertEquals(6, allTestObj.size());
  }
}
