package ca.bc.gov.oracleapi.repository.consep;

import static org.assertj.core.api.Assertions.assertThat;

import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.TestPropertySource;

@DataJpaTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;"
    + "MODE=Oracle;"
    + "DATABASE_TO_UPPER=false;"
    + "DB_CLOSE_DELAY=-1;"
    + "INIT=CREATE SCHEMA IF NOT EXISTS CONSEP",
    "spring.jpa.hibernate.ddl-auto=none",
    "spring.sql.init.mode=always"
})
class TestResultRepositoryTest {

  @Autowired
  private TestResultRepository testResultRepository;

  @Autowired
  private TestEntityManager entityManager;

  @Test
  void whenUpdateTestResultStatusToCompleted_thenTestCompleteIndIsUpdated() {
    BigDecimal riaKey = BigDecimal.valueOf(1001);
    TestResultEntity entity = new TestResultEntity();
    entity.setRiaKey(riaKey);
    entity.setTestCompleteInd(0);
    entityManager.persist(entity);
    entityManager.flush();

    testResultRepository.updateTestResultStatusToCompleted(riaKey);

    entityManager.clear();

    Optional<TestResultEntity> updatedEntity = testResultRepository.findById(riaKey);
    assertThat(updatedEntity).isPresent();
    assertThat(updatedEntity.get().getTestCompleteInd()).isEqualTo(1);
  }

  @Test
  void whenUpdateTestResultStatusToAccepted_thenAcceptResultIndIsUpdated() {
    BigDecimal riaKey = BigDecimal.valueOf(1002);
    TestResultEntity entity = new TestResultEntity();
    entity.setRiaKey(riaKey);
    entity.setAcceptResult(0);
    entityManager.persist(entity);
    entityManager.flush();

    testResultRepository.updateTestResultStatusToAccepted(riaKey);

    entityManager.clear();

    Optional<TestResultEntity> updatedEntity = testResultRepository.findById(riaKey);
    assertThat(updatedEntity).isPresent();
    assertThat(updatedEntity.get().getAcceptResult()).isEqualTo(1);
  }
}