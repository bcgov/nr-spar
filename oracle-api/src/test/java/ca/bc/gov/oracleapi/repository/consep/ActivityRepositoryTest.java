package ca.bc.gov.oracleapi.repository.consep;

import static org.assertj.core.api.Assertions.assertThat;

import ca.bc.gov.oracleapi.dto.consep.DrybackScreenDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
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

  @Test
  void legacyNullTimestampCanBeTouchedOnlyOnce() {
    ActivityEntity activity = persistActivity("00098", "G11", BEGIN, END);
    BigDecimal key = activity.getRiaKey();
    entityManager.flush();

    assertThat(activityRepository.updateTimestampWhereMatch(key, null)).isEqualTo(1);
    entityManager.clear();
    assertThat(activityRepository.findById(key).orElseThrow().getUpdateTimestamp()).isNotNull();
    assertThat(activityRepository.updateTimestampWhereMatch(key, null)).isZero();
  }

  @Test
  void legacyNullTimestampCanBeUsedForOnlyOneActivityUpdate() {
    ActivityEntity activity = persistActivity("00098", "G11", BEGIN, END);
    BigDecimal key = activity.getRiaKey();
    entityManager.flush();

    assertThat(activityRepository.updateActivityFieldWithLock(key, BEGIN, END, "STD", "first",
        null)).isEqualTo(1);
    assertThat(activityRepository.updateActivityFieldWithLock(key, BEGIN, END, "STD", "stale",
        null)).isZero();
    entityManager.clear();
    assertThat(activityRepository.findById(key).orElseThrow().getRiaComment()).isEqualTo("first");
  }

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

  private ActivityEntity persistActivityWithType(
      String seedlotNumber, String activityTypeCode, String standardActivityId,
      LocalDateTime begin, LocalDateTime end) {
    ActivityEntity entity = new ActivityEntity();
    entity.setSeedlotNumber(seedlotNumber);
    entity.setActivityTypeCode(activityTypeCode);
    entity.setStandardActivityId(standardActivityId);
    entity.setActualBeginDateTime(begin);
    entity.setActualEndDateTime(end);
    entityManager.persist(entity);
    return entity;
  }

  private TestResultEntity persistTestResult(
      BigDecimal riaKey, String activityType,
      Integer currentTest, Integer acceptResult,
      BigDecimal moisturePct) {
    TestResultEntity entity = new TestResultEntity();
    entity.setRiaKey(riaKey);
    entity.setActivityType(activityType);
    entity.setCurrentTest(currentTest);
    entity.setAcceptResult(acceptResult);
    entity.setMoisturePct(moisturePct);
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

  // ==================== G64 Dryback Screen Tests ====================

  @Test
  void findDrybackScreenDataByRiaSkey_shouldReturnDrybackWithMcFromDifferentActivity_whenMcActivityHasSameSeedlot() {
    // Given: G64 Dryback activity and MC test on different activity, same seedlot
    ActivityEntity drybackActivity = persistActivityWithType("00123", "G64", "G64", BEGIN, END);
    ActivityEntity mcActivity = persistActivityWithType("00123", "MC", "MC", BEGIN, END);

    entityManager.flush();

    BigDecimal drybackRiaKey = drybackActivity.getRiaKey();
    BigDecimal mcRiaKey = mcActivity.getRiaKey();

    // Create MC test result for the MC activity
    persistTestResult(mcRiaKey, "MC", -1, -1, BigDecimal.valueOf(12.5));

    entityManager.flush();

    // When: querying for dryback screen data
    Optional<DrybackScreenDto> result = activityRepository.findDrybackScreenDataByRiaSkey(drybackRiaKey);

    // Then: should return dryback data with storageMc from the MC activity
    assertThat(result).isPresent();
    assertThat(result.get().getRiaSkey()).isEqualByComparingTo(drybackRiaKey);
    assertThat(result.get().getSeedlotNumber()).isEqualTo("00123");
    assertThat(result.get().getStorageMc()).isEqualByComparingTo(BigDecimal.valueOf(12.5));
  }

  @Test
  void findDrybackScreenDataByRiaSkey_shouldReturnDrybackWithNullMc_whenNoMcTestExists() {
    // Given: G64 Dryback activity with no MC test
    ActivityEntity drybackActivity = persistActivityWithType("00124", "G64", "G64", BEGIN, END);
    entityManager.flush();

    BigDecimal drybackRiaKey = drybackActivity.getRiaKey();

    // When: querying for dryback screen data
    Optional<DrybackScreenDto> result = activityRepository.findDrybackScreenDataByRiaSkey(drybackRiaKey);

    // Then: should return dryback data with storageMc = null
    assertThat(result).isPresent();
    assertThat(result.get().getRiaSkey()).isEqualByComparingTo(drybackRiaKey);
    assertThat(result.get().getSeedlotNumber()).isEqualTo("00124");
    assertThat(result.get().getStorageMc()).isNull();
  }

  @Test
  void findDrybackScreenDataByRiaSkey_shouldIgnoreRejectedMcTest_andReturnNullStorageMc() {
    // Given: G64 activity and MC test with rejected result
    ActivityEntity drybackActivity = persistActivityWithType("00125", "G64", "G64", BEGIN, END);
    // Create separate MC activity for rejected test (can't reuse riaKey)
    ActivityEntity rejectedMcActivity = persistActivityWithType("00125", "MC", "MC", BEGIN, END);

    entityManager.flush();

    BigDecimal drybackRiaKey = drybackActivity.getRiaKey();
    BigDecimal rejectedMcRiaKey = rejectedMcActivity.getRiaKey();

    // Create MC test result that is REJECTED (acceptResult != -1)
    persistTestResult(rejectedMcRiaKey, "MC", -1, 0, BigDecimal.valueOf(13.0));

    entityManager.flush();

    // When: querying for dryback screen data
    Optional<DrybackScreenDto> result = activityRepository.findDrybackScreenDataByRiaSkey(drybackRiaKey);

    // Then: should ignore the rejected test and return storageMc = null
    assertThat(result).isPresent();
    assertThat(result.get().getStorageMc()).isNull();
  }

  @Test
  void findDrybackScreenDataByRiaSkey_shouldIgnoreNonCurrentMcTest_andReturnNullStorageMc() {
    // Given: G64 activity and MC test that is not current
    ActivityEntity drybackActivity = persistActivityWithType("00126", "G64", "G64", BEGIN, END);
    // Create separate MC activity for non-current test (can't reuse riaKey)
    ActivityEntity nonCurrentMcActivity = persistActivityWithType("00126", "MC", "MC", BEGIN, END);

    entityManager.flush();

    BigDecimal drybackRiaKey = drybackActivity.getRiaKey();
    BigDecimal nonCurrentMcRiaKey = nonCurrentMcActivity.getRiaKey();

    // Create MC test result that is NOT CURRENT (currentTest != -1)
    persistTestResult(nonCurrentMcRiaKey, "MC", 0, -1, BigDecimal.valueOf(14.0));

    entityManager.flush();

    // When: querying for dryback screen data
    Optional<DrybackScreenDto> result = activityRepository.findDrybackScreenDataByRiaSkey(drybackRiaKey);

    // Then: should ignore the non-current test and return storageMc = null
    assertThat(result).isPresent();
    assertThat(result.get().getStorageMc()).isNull();
  }

  @Test
  void findDrybackScreenDataByRiaSkey_shouldIgnoreMcTestOnUnrelatedSeedlot() {
    // Given: G64 activity on seedlot "00127" and MC test on seedlot "00128"
    ActivityEntity drybackActivity = persistActivityWithType("00127", "G64", "G64", BEGIN, END);
    ActivityEntity mcActivity = persistActivityWithType("00128", "MC", "MC", BEGIN, END);

    entityManager.flush();

    BigDecimal drybackRiaKey = drybackActivity.getRiaKey();
    BigDecimal mcRiaKey = mcActivity.getRiaKey();

    // Create MC test result
    persistTestResult(mcRiaKey, "MC", -1, -1, BigDecimal.valueOf(15.0));

    entityManager.flush();

    // When: querying for dryback screen data
    Optional<DrybackScreenDto> result = activityRepository.findDrybackScreenDataByRiaSkey(drybackRiaKey);

    // Then: should ignore the MC test on different seedlot and return storageMc = null
    assertThat(result).isPresent();
    assertThat(result.get().getSeedlotNumber()).isEqualTo("00127");
    assertThat(result.get().getStorageMc()).isNull();
  }

  @Test
  void findDrybackScreenDataByRiaSkey_shouldReturnEmpty_whenDrybackActivityDoesNotExist() {
    // Given: no activity with the requested riaKey
    entityManager.flush();

    BigDecimal nonExistentRiaKey = BigDecimal.valueOf(99999);

    // When: querying for non-existent dryback activity
    Optional<DrybackScreenDto> result = activityRepository.findDrybackScreenDataByRiaSkey(nonExistentRiaKey);

    // Then: should return empty optional
    assertThat(result).isEmpty();
  }

  @Test
  void findDrybackScreenDataByRiaSkey_shouldReturnDrybackWithCurrentAcceptedMc_whenMultipleMcActivitiesExist() {
    // Given: G64 activity with multiple MC activities (rejected and accepted)
    // This tests the non-unique-result scenario where the query must only join
    // MC activities that have an accepted test result
    ActivityEntity drybackActivity = persistActivityWithType("00129", "G64", "G64", BEGIN, END);
    
    // Create rejected MC activity
    ActivityEntity rejectedMcActivity = persistActivityWithType("00129", "MC", "MC", BEGIN, END);
    // Create accepted MC activity (must be separate to have distinct riaKey)
    ActivityEntity acceptedMcActivity = persistActivityWithType("00129", "MC", "MC", BEGIN.plusHours(1), END.plusHours(1));

    entityManager.flush();

    BigDecimal drybackRiaKey = drybackActivity.getRiaKey();
    BigDecimal rejectedMcRiaKey = rejectedMcActivity.getRiaKey();
    BigDecimal acceptedMcRiaKey = acceptedMcActivity.getRiaKey();

    // Create a rejected MC test
    persistTestResult(rejectedMcRiaKey, "MC", -1, 0, BigDecimal.valueOf(11.0));
    // Create the current accepted MC test
    persistTestResult(acceptedMcRiaKey, "MC", -1, -1, BigDecimal.valueOf(12.3));

    entityManager.flush();

    // When: querying for dryback screen data
    Optional<DrybackScreenDto> result = activityRepository.findDrybackScreenDataByRiaSkey(drybackRiaKey);

    // Then: should return the accepted test value (not throw non-unique-result exception)
    assertThat(result).isPresent();
    assertThat(result.get().getStorageMc()).isEqualByComparingTo(BigDecimal.valueOf(12.3));
  }
}

