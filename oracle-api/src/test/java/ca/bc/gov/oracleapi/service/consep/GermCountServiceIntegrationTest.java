package ca.bc.gov.oracleapi.service.consep;

import static org.assertj.core.api.Assertions.assertThat;

import ca.bc.gov.oracleapi.dto.consep.DayGermCountDto;
import ca.bc.gov.oracleapi.dto.consep.GermCountDto;
import ca.bc.gov.oracleapi.dto.consep.GermCountUpsertRequestDto;
import ca.bc.gov.oracleapi.dto.consep.ReplicateAbnormalDto;
import ca.bc.gov.oracleapi.dto.consep.TestRepGermFormDto;
import ca.bc.gov.oracleapi.mapper.GermCountMapper;
import ca.bc.gov.oracleapi.mapper.TestRepGermFormMapper;
import ca.bc.gov.oracleapi.repository.consep.DailyAbnormalRepository;
import ca.bc.gov.oracleapi.repository.consep.GermCountRepository;
import ca.bc.gov.oracleapi.repository.consep.TestRepGermRepository;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.util.ReflectionTestUtils;

/**
 * Regression coverage for the INSERT path of {@link GermCountService#upsertGermCounts}.
 *
 * <p>Uses a real {@link EntityManager} (via {@code @DataJpaTest}) instead of Mockito, because
 * the bug this guards against only manifests against a real persistence context: for a brand
 * new {@link ca.bc.gov.oracleapi.entity.consep.GermCountEntity}, the id (riaSkey) is set
 * before {@code save()} is called. Since the entity has no {@code @GeneratedValue} or
 * {@code @Version}, Spring Data's default {@code isNew()} check treats it as "not new" and
 * {@code save()} performs an {@code entityManager.merge(entity)}, which returns a different
 * managed instance and leaves the original local variable detached. A subsequent
 * {@code entityManager.refresh(entity)} on the stale (detached) reference then throws
 * {@code IllegalArgumentException: Entity not managed}. A Mockito-based test can't catch this
 * because a mocked repository's {@code save()} never performs a real merge.
 */
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
class GermCountServiceIntegrationTest {

  @Autowired
  private GermCountRepository germCountRepository;

  @Autowired
  private DailyAbnormalRepository dailyAbnormalRepository;

  @Autowired
  private TestRepGermRepository testRepGermRepository;

  @Autowired
  private EntityManager entityManager;

  private GermCountService germCountService;

  @BeforeEach
  void setUp() {
    GermCountMapper mapper = Mappers.getMapper(GermCountMapper.class);
    TestRepGermFormMapper repFormMapper = Mappers.getMapper(TestRepGermFormMapper.class);
    germCountService = new GermCountService(
        germCountRepository, mapper, repFormMapper,
        dailyAbnormalRepository, testRepGermRepository);
    ReflectionTestUtils.setField(germCountService, "entityManager", entityManager);
  }

  private static ReplicateAbnormalDto zeroAbnormal() {
    return new ReplicateAbnormalDto(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null);
  }

  private static TestRepGermFormDto rep(int n, int total) {
    return new TestRepGermFormDto(n, total, 0, 0, 0, 0, 0, 0, 0, 1, null);
  }

  @Test
  void upsertGermCounts_insertsNewRecord_andSurvivesFlushAndRefresh() {
    BigDecimal riaSkey = new BigDecimal("990001");

    DayGermCountDto day = new DayGermCountDto(
        1, LocalDate.of(2026, 4, 1), 1, 10, 12, 11, 9,
        zeroAbnormal(), zeroAbnormal(), zeroAbnormal(), zeroAbnormal());

    GermCountUpsertRequestDto request = new GermCountUpsertRequestDto(
        null,
        List.of(day),
        List.of(rep(1, 100), rep(2, 100), rep(3, 100), rep(4, 100)));

    GermCountDto result = germCountService.upsertGermCounts(riaSkey, request, "USER1");

    assertThat(result).isNotNull();
    assertThat(result.updateTimestamp()).isNotNull();
    assertThat(germCountRepository.findById(riaSkey)).isPresent();
  }
}
