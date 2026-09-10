package ca.bc.gov.oracleapi.repository.consep;

import static org.assertj.core.api.Assertions.assertThat;

import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.TestPropertySource;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:activityrepositorytestdb;"
    + "MODE=Oracle;"
    + "DB_CLOSE_DELAY=-1",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.sql.init.mode=always",
    "spring.sql.init.schema-locations=classpath:schema-consep-only.sql"
})
class ActivityRepositoryTest {

  @Autowired
  private ActivityRepository activityRepository;

  @Autowired
  private TestEntityManager entityManager;

  private static final LocalDateTime BEGIN = LocalDateTime.of(2026, 5, 10, 9, 0, 0);
  private static final LocalDateTime END = LocalDateTime.of(2026, 5, 10, 12, 0, 0);

  private ActivityEntity persistActivity(
      String seedlotNumber, String standardActivityId,
      LocalDateTime begin, LocalDateTime end) {
    ActivityEntity entity = new ActivityEntity();
    entity.setSeedlotNumber(seedlotNumber);
    entity.setStandardActivityId(standardActivityId);
    entity.setActualBeginDateTime(begin);
    entity.setActualEndDateTime(end);
    entityManager.persist(entity);
    return entity;
  }

  @Test
  void existsDuplicateGerminationTest_shouldReturnTrue_whenAllFourFieldsMatch() {
    persistActivity("00098", "G11", BEGIN, END);
    entityManager.flush();

    boolean result = activityRepository
        .existsDuplicateGerminationTest("00098", "G11", BEGIN, END);

    assertThat(result).isTrue();
  }

  @Test
  void existsDuplicateGerminationTest_shouldReturnFalse_whenSeedlotNumberDiffers() {
    persistActivity("00099", "G11", BEGIN, END);
    entityManager.flush();

    boolean result = activityRepository
        .existsDuplicateGerminationTest("00098", "G11", BEGIN, END);

    assertThat(result).isFalse();
  }

  @Test
  void existsDuplicateGerminationTest_shouldReturnFalse_whenStandardActivityIdDiffers() {
    persistActivity("00098", "G12", BEGIN, END);
    entityManager.flush();

    boolean result = activityRepository
        .existsDuplicateGerminationTest("00098", "G11", BEGIN, END);

    assertThat(result).isFalse();
  }

  @Test
  void existsDuplicateGerminationTest_shouldReturnFalse_whenActualBeginDateTimeDiffers() {
    persistActivity("00098", "G11", BEGIN.plusHours(1), END);
    entityManager.flush();

    boolean result = activityRepository
        .existsDuplicateGerminationTest("00098", "G11", BEGIN, END);

    assertThat(result).isFalse();
  }

  @Test
  void existsDuplicateGerminationTest_shouldReturnFalse_whenActualEndDateTimeDiffers() {
    persistActivity("00098", "G11", BEGIN, END.plusHours(1));
    entityManager.flush();

    boolean result = activityRepository
        .existsDuplicateGerminationTest("00098", "G11", BEGIN, END);

    assertThat(result).isFalse();
  }
}
