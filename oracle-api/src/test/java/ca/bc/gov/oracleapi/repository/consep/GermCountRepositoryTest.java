package ca.bc.gov.oracleapi.repository.consep;

import static org.assertj.core.api.Assertions.assertThat;

import ca.bc.gov.oracleapi.entity.consep.GermCountEntity;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.TestPropertySource;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;"
    + "MODE=Oracle;"
    + "DB_CLOSE_DELAY=-1;"
    + "INIT=CREATE SCHEMA IF NOT EXISTS CONSEP",
    "spring.jpa.hibernate.ddl-auto=none",
    "spring.sql.init.mode=always"
})
class GermCountRepositoryTest {

  @Autowired
  private GermCountRepository germCountRepository;

  @Autowired
  private TestEntityManager entityManager;

  private GermCountEntity persistRow(BigDecimal riaSkey, LocalDateTime updateTs) {
    GermCountEntity e = new GermCountEntity();
    e.setRiaSkey(riaSkey);
    e.setUpdateTimestamp(updateTs);
    entityManager.persist(e);
    entityManager.flush();
    entityManager.clear();
    return e;
  }

  @Test
  void nextDailyGermSkey_returnsIncreasingValues() {
    BigDecimal first = germCountRepository.nextDailyGermSkey();
    BigDecimal second = germCountRepository.nextDailyGermSkey();
    assertThat(first).isNotNull();
    assertThat(second).isGreaterThan(first);
  }

  @Test
  void touchIfTimestampMatches_updatesOneRow_whenTimestampMatches() {
    LocalDateTime ts = LocalDateTime.of(2026, 4, 5, 14, 30, 0);
    persistRow(BigDecimal.valueOf(881191), ts);

    int rows = germCountRepository.touchIfTimestampMatches(BigDecimal.valueOf(881191), ts);

    assertThat(rows).isEqualTo(1);
  }

  @Test
  void touchIfTimestampMatches_updatesNoRows_whenTimestampStale() {
    LocalDateTime ts = LocalDateTime.of(2026, 4, 5, 14, 30, 0);
    persistRow(BigDecimal.valueOf(881191), ts);

    int rows = germCountRepository.touchIfTimestampMatches(
        BigDecimal.valueOf(881191), ts.minusHours(1));

    assertThat(rows).isZero();
  }
}
