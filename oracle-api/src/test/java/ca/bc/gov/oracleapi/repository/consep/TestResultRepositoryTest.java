package ca.bc.gov.oracleapi.repository.consep;


import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.jdbc.Sql;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
public class TestResultRepositoryTest {
    
  @Autowired private TestResultRepository testResultRepository;

  @Test
  @DisplayName("updateTestResultStatusToCompletedTest")
  @Sql(scripts = {"classpath:scripts/TestResultRepository.sql"})
  void updateTestResultStatusToCompletedTest() {
    BigDecimal riaKey = new BigDecimal(1);
    testResultRepository.updateTestResultStatusToCompleted(riaKey);
    List<TestResultEntity> testResultEntities = testResultRepository.findAll();
    assertFalse(testResultEntities.isEmpty());
    TestResultEntity testResultEntity = testResultEntities.get(0);
    assertEquals(1, testResultEntity.getTestCompleteInd());
  }

  @Test
  @DisplayName("updateTestResultStatusToAcceptedTest")
  @Sql(scripts = {"classpath:scripts/TestResultRepository.sql"})
  void updateTestResultStatusToAcceptedTest() {
      BigDecimal riaKey = new BigDecimal(1);
      testResultRepository.updateTestResultStatusToAccepted(riaKey);
      List<TestResultEntity> testResultEntities = testResultRepository.findAll();
      assertFalse(testResultEntities.isEmpty());
      TestResultEntity testResultEntity = testResultEntities.get(0);
      assertEquals(1, testResultEntity.getAcceptResult());
  }
}
