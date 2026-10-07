package ca.bc.gov.oracleapi.service.consep;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import ca.bc.gov.oracleapi.dto.consep.ActivitySearchResponseDto;
import ca.bc.gov.oracleapi.dto.consep.CopyGerminationTestResultsDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.entity.consep.DailyAbnormalEntity;
import ca.bc.gov.oracleapi.entity.consep.GermCountEntity;
import ca.bc.gov.oracleapi.entity.consep.SparRequestEntity;
import ca.bc.gov.oracleapi.entity.consep.TestRegimeEntity;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.mapper.GermCountMapperImpl;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.TestPropertySource;
import org.springframework.web.server.ResponseStatusException;

/**
 * Copy Results against a real database: the new daily germ keys come from a sequence, so whether
 * the copy shares the source's keys only shows up in actual writes.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:copygermtestresultstestdb;"
    + "MODE=Oracle;"
    + "DB_CLOSE_DELAY=-1",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.sql.init.mode=always",
    "spring.sql.init.schema-locations=classpath:schema-consep-only.sql"
})
@Import({ActivityService.class, GermCountMapperImpl.class})
class CopyGerminationTestResultsTest {

  private static final BigDecimal SOURCE_SKEY = new BigDecimal("500");
  private static final LocalDateTime BEGIN = LocalDateTime.of(2026, 3, 1, 9, 0);
  private static final LocalDateTime END = LocalDateTime.of(2026, 3, 22, 9, 0);

  @Autowired
  private ActivityService activityService;

  @Autowired
  private TestEntityManager em;

  private BigDecimal sourceRiaKey;

  private void insertNonEntityRow(String sql, Object... params) {
    var query = em.getEntityManager().createNativeQuery(sql);
    for (int i = 0; i < params.length; i++) {
      query.setParameter(i + 1, params[i]);
    }
    query.executeUpdate();
  }

  @BeforeEach
  void seed() {
    TestRegimeEntity regime = new TestRegimeEntity();
    regime.setSeedlotTestCode("G10");
    em.persist(regime);

    // Target: TST20260001, item B, seedlot 00099 (SX); a PLI seedlot on item C.
    SparRequestEntity request = new SparRequestEntity();
    request.setRequestSkey(BigDecimal.ONE);
    request.setRequestTypeSt("TST");
    request.setRequestYr(2026);
    request.setRequestSequence(1);
    em.persist(request);
    insertNonEntityRow("INSERT INTO CONSEP.CNS_T_REQUEST_SEEDLOT VALUES (1, 'B', '00099')");
    insertNonEntityRow("INSERT INTO CONSEP.CNS_T_REQUEST_SEEDLOT VALUES (1, 'C', '00100')");
    insertNonEntityRow("INSERT INTO CONSEP.CNS_T_SEEDLOT VALUES ('00099', 'SX')");
    insertNonEntityRow("INSERT INTO CONSEP.CNS_T_SEEDLOT VALUES ('00100', 'PLI')");

    ActivityEntity source = new ActivityEntity();
    source.setRequestSkey(new BigDecimal("2"));
    source.setRequestId("TST20250007");
    source.setItemId("A");
    source.setSeedlotNumber("00098");
    source.setVegetationState("SX");
    source.setActivityTypeCode("G10");
    source.setStandardActivityId("G10");
    source.setTestCategoryCode("QA");
    source.setSignificantStatusIndicator(-1);
    source.setActivityDuration(21);
    source.setActivityTimeUnit("DAY");
    source.setProcessCommitIndicator(-1);
    source.setActualBeginDateTime(BEGIN);
    source.setActualEndDateTime(END);
    source.setRiaComment("original comment");
    sourceRiaKey = em.persistAndGetId(source, BigDecimal.class);

    TestResultEntity result = new TestResultEntity();
    result.setRiaKey(sourceRiaKey);
    result.setActivityType("G10");
    result.setTestCategory("QA");
    result.setStandardTest(0);
    result.setAcceptResult(-1);
    result.setTestCompleteInd(-1);
    result.setOriginalTest(-1);
    result.setCurrentTest(-1);
    result.setTestRank("A");
    result.setGerminationPct(93);
    result.setGerminationValue(40);
    result.setPeakValueGrmPct(12);
    result.setPeakValueNoDays(7);
    result.setMoisturePct(new BigDecimal("8.5"));
    em.persist(result);

    // Day 1 carries an abnormal row; day 2 is a normal day with no key.
    GermCountEntity counts = new GermCountEntity();
    counts.setRiaSkey(sourceRiaKey);
    counts.setDailyGermSkey1(SOURCE_SKEY);
    counts.setCountDt1(LocalDate.of(2026, 3, 8));
    counts.setRep1NoSeedsGerm1(20);
    counts.setCountDt2(LocalDate.of(2026, 3, 15));
    counts.setRep1NoSeedsGerm2(5);
    counts.setEntryUserid("IDIR\\RROBB");
    em.persist(counts);

    DailyAbnormalEntity abnormal = new DailyAbnormalEntity();
    abnormal.setDailyGermSkey(SOURCE_SKEY);
    abnormal.setRep1NoAbnrmRe(3);
    abnormal.setRep4NoAbnrmOther(1);
    em.persist(abnormal);
    em.flush();
  }

  private ActivitySearchResponseDto copyTo(String seedlot, String requestId) {
    ActivitySearchResponseDto copied = activityService.copyGerminationTestResults(
        sourceRiaKey, new CopyGerminationTestResultsDto(seedlot, requestId));
    em.flush();
    em.clear();
    return copied;
  }

  @Test
  void copiesTheTestToTheTargetRequestItemAsANewStandardTest() {
    BigDecimal key = BigDecimal.valueOf(copyTo("00099", "TST20260001B").riaSkey());

    ActivityEntity activity = em.find(ActivityEntity.class, key);
    assertThat(activity.getRequestSkey()).isEqualByComparingTo(BigDecimal.ONE);
    assertThat(activity.getRequestId()).isEqualTo("TST20260001");
    assertThat(activity.getItemId()).isEqualTo("B");
    assertThat(activity.getSeedlotNumber()).isEqualTo("00099");
    assertThat(activity.getTestCategoryCode()).isEqualTo("STD");
    assertThat(activity.getSignificantStatusIndicator()).isZero();
    assertThat(activity.getProcessCommitIndicator()).isZero();
    assertThat(activity.getTestResultIndicator()).isEqualTo(-1);
    assertThat(activity.getActualBeginDateTime()).isEqualTo(BEGIN);
    assertThat(activity.getActualEndDateTime()).isEqualTo(END);
    assertThat(activity.getRiaComment()).isEqualTo("Test results copied from Seedlot 00098");

    TestResultEntity result = em.find(TestResultEntity.class, key);
    assertThat(result.getTestCategory()).isEqualTo("STD");
    assertThat(result.getStandardTest()).isEqualTo(-1);
    assertThat(result.getAcceptResult()).isZero();
    assertThat(result.getTestCompleteInd()).isZero();
    assertThat(result.getOriginalTest()).isZero();
    assertThat(result.getCurrentTest()).isZero();
    assertThat(result.getTestRank()).isNull();
    assertThat(result.getGerminationPct()).isEqualTo(93);
    assertThat(result.getPeakValueNoDays()).isEqualTo(7);
    assertThat(result.getMoisturePct()).isEqualByComparingTo(BigDecimal.ZERO);
  }

  @Test
  void givesTheCopyItsOwnDailyGermKeysWithoutCopyingAbnormals() {
    BigDecimal key = BigDecimal.valueOf(copyTo("00099", "TST20260001B").riaSkey());

    GermCountEntity counts = em.find(GermCountEntity.class, key);
    BigDecimal newSkey = counts.getDailyGermSkey1();
    assertThat(newSkey).isNotNull().isNotEqualByComparingTo(SOURCE_SKEY);
    assertThat(counts.getRep1NoSeedsGerm1()).isEqualTo(20);
    assertThat(counts.getDailyGermSkey2()).isNull();
    assertThat(counts.getRep1NoSeedsGerm2()).isEqualTo(5);
    assertThat(counts.getEntryUserid()).isEqualTo("IDIR\\RROBB");
    assertThat(counts.getUpdateUserid()).isEqualTo(ActivityService.COPY_UPDATE_USERID);

    // Abnormals are not copied (Ron: no longer used); the new key points at nothing.
    assertThat(em.find(DailyAbnormalEntity.class, newSkey)).isNull();

    // The source keeps its key and its row; nothing points the two tests at the same abnormals.
    assertThat(em.find(GermCountEntity.class, sourceRiaKey).getDailyGermSkey1())
        .isEqualByComparingTo(SOURCE_SKEY);
    assertThat(em.find(DailyAbnormalEntity.class, SOURCE_SKEY).getRep1NoAbnrmRe()).isEqualTo(3);
  }

  @Test
  void rejectsCopyingTheSameTestToTheSameSeedlotTwice() {
    copyTo("00099", "TST20260001B");

    assertThatThrownBy(() -> copyTo("00099", "TST20260001B"))
        .isInstanceOfSatisfying(ResponseStatusException.class,
            e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
  }

  @Test
  void rejectsATargetSeedlotOfAnotherSpecies() {
    assertThatThrownBy(() -> copyTo("00100", "TST20260001C"))
        .isInstanceOfSatisfying(ResponseStatusException.class, e -> {
          assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
          assertThat(e.getReason()).contains("same species");
        });
  }
}
