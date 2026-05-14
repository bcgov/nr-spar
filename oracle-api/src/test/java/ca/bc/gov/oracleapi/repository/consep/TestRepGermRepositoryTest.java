package ca.bc.gov.oracleapi.repository.consep;

import static org.assertj.core.api.Assertions.assertThat;

import ca.bc.gov.oracleapi.entity.consep.TestRepGermEntity;
import ca.bc.gov.oracleapi.entity.consep.idclass.ReplicateId;
import java.math.BigDecimal;
import java.util.List;
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
class TestRepGermRepositoryTest {

  @Autowired
  private TestRepGermRepository testRepGermRepository;

  @Autowired
  private TestEntityManager entityManager;

  private TestRepGermEntity buildEntity(BigDecimal riaKey, int replicateNumber, int totalSeeds) {
    TestRepGermEntity entity = new TestRepGermEntity();
    entity.setId(new ReplicateId(riaKey, replicateNumber));
    entity.setTotalNoSeeds(totalSeeds);
    entity.setFinalUngrmNormal(1);
    entity.setFinalUngrmShrvl(2);
    entity.setFinalUngrmEmpty(3);
    entity.setFinalUngrmInsct(4);
    entity.setFinalUngrmDamagd(5);
    entity.setFinalUngrmRotten(6);
    entity.setFinalPregerm(7);
    entity.setRepAcceptedInd(1);
    entity.setTolrncOvrrdeDesc("ok");
    return entity;
  }

  @Test
  void whenFindByRiaKey_thenReplicatesAreReturnedInReplicateNumberOrder() {
    BigDecimal riaKey = BigDecimal.valueOf(881191);
    entityManager.persist(buildEntity(riaKey, 2, 50));
    entityManager.persist(buildEntity(riaKey, 1, 100));
    entityManager.persist(buildEntity(BigDecimal.valueOf(999999), 1, 25));
    entityManager.flush();
    entityManager.clear();

    List<TestRepGermEntity> result =
        testRepGermRepository.findByRiaKeyOrderByReplicateNumber(riaKey);

    assertThat(result).hasSize(2);
    assertThat(result.get(0).getId().getReplicateNumber()).isEqualTo(1);
    assertThat(result.get(0).getId().getRiaKey()).isEqualByComparingTo(riaKey);
    assertThat(result.get(0).getTotalNoSeeds()).isEqualTo(100);
    assertThat(result.get(0).getFinalUngrmNormal()).isEqualTo(1);
    assertThat(result.get(0).getFinalUngrmShrvl()).isEqualTo(2);
    assertThat(result.get(0).getFinalUngrmEmpty()).isEqualTo(3);
    assertThat(result.get(0).getFinalUngrmInsct()).isEqualTo(4);
    assertThat(result.get(0).getFinalUngrmDamagd()).isEqualTo(5);
    assertThat(result.get(0).getFinalUngrmRotten()).isEqualTo(6);
    assertThat(result.get(0).getFinalPregerm()).isEqualTo(7);
    assertThat(result.get(0).getRepAcceptedInd()).isEqualTo(1);
    assertThat(result.get(0).getTolrncOvrrdeDesc()).isEqualTo("ok");
    assertThat(result.get(1).getId().getReplicateNumber()).isEqualTo(2);
    assertThat(result.get(1).getTotalNoSeeds()).isEqualTo(50);
  }

  @Test
  void whenFindByRiaKey_andNoneExist_thenReturnsEmptyList() {
    List<TestRepGermEntity> result =
        testRepGermRepository.findByRiaKeyOrderByReplicateNumber(BigDecimal.valueOf(123));

    assertThat(result).isEmpty();
  }
}
