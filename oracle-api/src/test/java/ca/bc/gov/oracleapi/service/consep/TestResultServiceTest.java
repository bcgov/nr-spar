package ca.bc.gov.oracleapi.service.consep;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.oracleapi.dto.consep.DailyAbnormalResponseDto;
import ca.bc.gov.oracleapi.dto.consep.GerminationTestUpdateFormDto;
import ca.bc.gov.oracleapi.dto.consep.GermTestResultDto;
import ca.bc.gov.oracleapi.dto.consep.GerminationTestHeaderDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayCreateDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayCreateResponseDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.entity.consep.DailyAbnormalEntity;
import ca.bc.gov.oracleapi.entity.consep.GermCountEntity;
import ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity;
import ca.bc.gov.oracleapi.entity.consep.TestRegimeEntity;
import ca.bc.gov.oracleapi.entity.consep.TestRepGermEntity;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.entity.consep.idclass.ReplicateId;
import ca.bc.gov.oracleapi.repository.consep.ActivityRepository;
import ca.bc.gov.oracleapi.repository.consep.DailyAbnormalRepository;
import ca.bc.gov.oracleapi.repository.consep.GermCountRepository;
import ca.bc.gov.oracleapi.repository.consep.GerminatorTrayRepository;
import ca.bc.gov.oracleapi.repository.consep.TestRegimeRepository;
import ca.bc.gov.oracleapi.repository.consep.TestRepGermRepository;
import ca.bc.gov.oracleapi.repository.consep.TestResultRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.IncorrectResultSizeDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** The test class for Test Result Service. */
@ExtendWith(MockitoExtension.class)
class TestResultServiceTest {

  @Mock
  private TestResultRepository testResultRepository;

  @Mock
  private ActivityRepository activityRepository;

  @Mock
  private GerminatorTrayRepository germinatorTrayRepository;

  @Mock
  private TestRegimeRepository testRegimeRepository;

  @Mock
  private DailyAbnormalRepository dailyAbnormalRepository;

  @Mock
  private GermCountRepository germCountRepository;

  @Mock
  private TestRepGermRepository testRepGermRepository;

  @Autowired
  @InjectMocks
  private TestResultService testResultService;

  private BigDecimal riaKey;
  private TestResultEntity testResultEntity;

  private static final String GERMINATOR_TRAY_VALIDATION_ERROR_MESSAGE =
      "Could not create germinator tray. Possible reasons: "
          + "Seed has not been withdrawn, not all tests are germination tests, "
          + "and/or a germinator tray ID is already assigned.";

  @BeforeEach
  void setUp() {
    riaKey = new BigDecimal("123");

    testResultEntity = new TestResultEntity();
    testResultEntity.setTestCompleteInd(1);
    testResultEntity.setSampleDesc("Sample");
    testResultEntity.setMoistureStatus("Status");
    testResultEntity.setMoisturePct(new BigDecimal("50.5"));
    testResultEntity.setAcceptResult(1);
  }

  @Test
  void updateTestResultStatusToCompleted_success() {
    doNothing().when(testResultRepository).updateTestResultStatusToCompleted(riaKey);

    assertDoesNotThrow(() -> testResultService.updateTestResultStatusToCompleted(riaKey));
    verify(testResultRepository).updateTestResultStatusToCompleted(riaKey);
  }

  @Test
  void acceptTestResult_success() {
    when(testResultRepository.findById(riaKey)).thenReturn(Optional.of(testResultEntity));

    assertDoesNotThrow(() -> testResultService.acceptTestResult(riaKey));
    verify(testResultRepository).updateTestResultStatusToAccepted(riaKey);
  }

  @Test
  void acceptTestResult_testNotCompleted() {
    testResultEntity.setTestCompleteInd(0);
    testResultEntity.setSampleDesc("Sample");
    testResultEntity.setMoistureStatus("Status");
    testResultEntity.setMoisturePct(new BigDecimal("50.5"));
    testResultEntity.setAcceptResult(1);

    when(testResultRepository.findById(riaKey)).thenReturn(Optional.of(testResultEntity));

    ResponseStatusException exception =
        assertThrows(
            ResponseStatusException.class, () -> testResultService.acceptTestResult(riaKey));

    assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    assertEquals("Test is not completed", exception.getReason());
  }

  /*---------------------- Assign Germinator Trays ---------------------------------*/
  @Test
  void assignGerminatorTrays_shouldThrow_whenRequestsNullOrEmpty() {
    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class, () -> testResultService.assignGerminatorTrays(null));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals("Create germinator tray request list cannot be null or empty", ex.getReason());

    ex =
        assertThrows(
            ResponseStatusException.class,
            () -> testResultService.assignGerminatorTrays(Collections.emptyList()));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
  }

  @Test
  void assignGerminatorTrays_createsTrays_andAssignsActivities() {
    // Arrange: 7 activities of two types -> expect 3 trays
    String activityTypeCdG10 = "G10";
    String activityTypeCdRts = "RTS";
    LocalDateTime now = LocalDateTime.now();
    final List<GerminatorTrayCreateDto> requests =
        List.of(
            new GerminatorTrayCreateDto(
                activityTypeCdG10, new BigDecimal("881191"), now.minusDays(2)),
            new GerminatorTrayCreateDto(activityTypeCdG10, new BigDecimal("881192"), now),
            new GerminatorTrayCreateDto(
                activityTypeCdG10, new BigDecimal("881193"), now.minusDays(1)),
            new GerminatorTrayCreateDto(
                activityTypeCdG10, new BigDecimal("881194"), now.minusDays(1)),
            new GerminatorTrayCreateDto(
                activityTypeCdG10, new BigDecimal("881195"), now.plusDays(2)),
            new GerminatorTrayCreateDto(
                activityTypeCdG10, new BigDecimal("881196"), now.plusDays(3)),
            new GerminatorTrayCreateDto(
                activityTypeCdRts, new BigDecimal("881197"), now.minusDays(4)));

    // Prepare mock trays: save() should return different tray entities sequentially
    // (3 trays expected)
    GerminatorTrayEntity tray1 = new GerminatorTrayEntity();
    tray1.setGerminatorTrayId(101);
    tray1.setActualStartDate(LocalDate.now().atStartOfDay());

    GerminatorTrayEntity tray2 = new GerminatorTrayEntity();
    tray2.setGerminatorTrayId(102);
    tray2.setActualStartDate(LocalDate.now().atStartOfDay());

    GerminatorTrayEntity tray3 = new GerminatorTrayEntity();
    tray3.setGerminatorTrayId(103);
    tray3.setActualStartDate(LocalDate.now().atStartOfDay());

    when(germinatorTrayRepository.save(any()))
        .thenAnswer(
            inv -> {
              GerminatorTrayEntity arg = inv.getArgument(0, GerminatorTrayEntity.class);
              // If it's the RTS group, return tray1 (id 101)
              if ("RTS".equals(arg.getActivityTypeCd())) {
                return tray1;
              }
              // G10 group: systemTrayNo 1 -> tray2 (id 102), systemTrayNo 2 -> tray3 (id 103)
              if ("G10".equals(arg.getActivityTypeCd())) {
                if (arg.getSystemTrayNo() != null && arg.getSystemTrayNo().equals(1)) {
                  return tray2;
                } else {
                  return tray3;
                }
              }
              // Fallback: return the entity (or a default tray)
              return arg;
            });

    // Mock activityRepository.findById to return an ActivityEntity for any ria key
    when(activityRepository.findById(any()))
        .thenAnswer(
            inv -> {
              BigDecimal key = inv.getArgument(0, BigDecimal.class);
              ActivityEntity act = new ActivityEntity();
              act.setRiaKey(key);
              act.setActivityDuration(7);
              act.setRequestSkey(new BigDecimal("221"));
              act.setItemId("A");
              // Set activityTypeCode based on the specific test keys
              if (key.compareTo(new BigDecimal("881197")) == 0) {
                act.setActivityTypeCode(activityTypeCdRts);
              } else {
                act.setActivityTypeCode(activityTypeCdG10);
              }
              return Optional.of(act);
            });

    // Allow validation to recognise these activity types as germ tests
    when(testRegimeRepository.findAllGermTestActivityTypeCodes())
        .thenReturn(List.of(activityTypeCdG10, activityTypeCdRts));
    // Prepare GermTestResultDto
    GermTestResultDto germTestResultDto =
        new GermTestResultDto(
            LocalDate.now(),
            48,
            LocalDate.now(),
            activityTypeCdG10,
            72,
            96,
            LocalDate.now().minusDays(1),
            null);
    when(testResultRepository.getGermTestResult(any())).thenReturn(germTestResultDto);

    // No conflicts for commit (always empty)
    when(activityRepository.findConflictingActivities(any(), any(), any()))
        .thenReturn(Collections.emptyList());

    // Do nothing for update methods
    doNothing()
        .when(testResultRepository)
        .saveGerminatorTray(any(), any(), any(), any(), any(), any(), any());
    doNothing().when(testResultRepository).updateGerminatorTray(any(), any());
    doNothing().when(activityRepository).markSignificantAndCommit(any());
    doNothing()
        .when(activityRepository)
        .updateActualBeginAndRevisedDates(any(), any(), any(), any());

    // Act
    List<GerminatorTrayCreateResponseDto> response =
        testResultService.assignGerminatorTrays(requests);

    // Assert: three trays created
    assertEquals(3, response.size());
    Set<Integer> returnedIds = new HashSet<>();
    response.forEach(
        r -> {
          // activityTypeCd should be either G10 or RTS (grouping key is used in responses)
          assertTrue(
              activityTypeCdG10.equals(r.activityTypeCd())
                  || activityTypeCdRts.equals(r.activityTypeCd()));
          returnedIds.add(r.germinatorTrayId());
          assertNotNull(r.actualStartDate());
        });
    assertTrue(returnedIds.contains(101));
    assertTrue(returnedIds.contains(102));
    assertTrue(returnedIds.contains(103));

    // Verify interactions
    verify(germinatorTrayRepository, times(3)).save(any());
    verify(activityRepository, times(7)).findById(any());
    // At least one call (validation + assignment calls vary with inputs)
    verify(testResultRepository, atLeast(1)).getGermTestResult(any());

    // Verify updateGerminatorTray called once
    // for the activity that had actualBeginDtTm == today (881192 -> tray2 id 102)
    verify(testResultRepository).updateGerminatorTray(new BigDecimal("881192"), 102);

    // No conflicts -> markSignificantAndCommit should be called for the RTS activity (881197)
    verify(activityRepository, times(1)).markSignificantAndCommit(new BigDecimal("881197"));
  }

  @Test
  void assignGerminatorTrays_shouldThrow_whenActivityNotFound() {
    String activityTypeCd = "G20";
    BigDecimal riaSkey = new BigDecimal("881190");
    final List<GerminatorTrayCreateDto> requests =
        List.of(new GerminatorTrayCreateDto(activityTypeCd, riaSkey, null));

    // Stub tray save so service can proceed to activity lookup
    GerminatorTrayEntity savedTray = new GerminatorTrayEntity();
    savedTray.setGerminatorTrayId(555);
    savedTray.setActualStartDate(LocalDate.now().atStartOfDay());
    when(germinatorTrayRepository.save(any())).thenReturn(savedTray);

    // stub test regime codes
    when(testRegimeRepository.findAllGermTestActivityTypeCodes())
        .thenReturn(List.of(activityTypeCd));

    // return a valid germTestResult for validation to pass
    GermTestResultDto valid =
        new GermTestResultDto(
            LocalDate.now().minusDays(1),
            48,
            LocalDate.now(),
            activityTypeCd,
            72,
            96,
            LocalDate.now().minusDays(1),
            null);
    when(testResultRepository.getGermTestResult(riaSkey)).thenReturn(valid);

    // Activity not found
    when(activityRepository.findById(riaSkey)).thenReturn(Optional.empty());

    // Act / Assert
    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class, () -> testResultService.assignGerminatorTrays(requests));

    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    assertEquals("Activity not found in CNS_T_RQST_ITM_ACTVTY table", ex.getReason());

    // Verify interactions
    verify(germinatorTrayRepository).save(any());
    verify(activityRepository).findById(riaSkey);
  }

  @Test
  void assignGerminatorTrays_shouldThrowNotFound_whenGermTestResultMissing() {
    String activityTypeCd = "G20";
    BigDecimal riaSkey = new BigDecimal("881190");
    LocalDateTime now = LocalDateTime.now();
    LocalDateTime past = now.minusDays(1);
    final List<GerminatorTrayCreateDto> requests =
        List.of(new GerminatorTrayCreateDto(activityTypeCd, riaSkey, past));

    // Ensure validation recognises this activity type as a germ test
    when(testRegimeRepository.findAllGermTestActivityTypeCodes())
        .thenReturn(List.of(activityTypeCd));

    // Validation will call getGermTestResult(...) and we want it to be missing (null) -> NOT_FOUND
    when(testResultRepository.getGermTestResult(riaSkey)).thenReturn(null);

    // Act / Assert
    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class, () -> testResultService.assignGerminatorTrays(requests));

    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    assertEquals(
        String.format("No test result found for activity with RIA_SKEY %s", riaSkey),
        ex.getReason());

    // Validation short-circuits, so no trays are created and no activity lookups occur
    verify(testResultRepository).getGermTestResult(riaSkey);
    verify(germinatorTrayRepository, never()).save(any());
    verify(activityRepository, never()).findById(any());
  }

  @Test
  void assignGerminatorTrays_shouldNotCommit_whenConflictsExist() {
    // Arrange for RTS type using riaSkey 881197
    String activityTypeCd = "RTS";
    BigDecimal riaSkey = new BigDecimal("881197");
    final List<GerminatorTrayCreateDto> requests =
        List.of(
            new GerminatorTrayCreateDto(activityTypeCd, riaSkey, LocalDateTime.now().minusDays(1)));

    ActivityEntity act = new ActivityEntity();
    act.setRiaKey(riaSkey);
    act.setActivityDuration(7);
    act.setRequestSkey(new BigDecimal("221"));
    act.setItemId("T");
    act.setActivityTypeCode(activityTypeCd);

    // Stub tray save to return one tray
    GerminatorTrayEntity tray = new GerminatorTrayEntity();
    tray.setGerminatorTrayId(201);
    tray.setActualStartDate(LocalDate.now().atStartOfDay());
    when(germinatorTrayRepository.save(any())).thenReturn(tray);

    when(activityRepository.findById(riaSkey)).thenReturn(Optional.of(act));

    when(testRegimeRepository.findAllGermTestActivityTypeCodes())
        .thenReturn(List.of("RTS", "G10")); // include codes used in the test
    GermTestResultDto germTestResultDto =
        new GermTestResultDto(
            LocalDate.now(),
            48,
            LocalDate.now(),
            activityTypeCd,
            72,
            96,
            LocalDate.now().minusDays(1),
            null);
    when(testResultRepository.getGermTestResult(any())).thenReturn(germTestResultDto);

    // Conflict found for this RTS activity
    ActivityEntity conflictingAct = new ActivityEntity();
    conflictingAct.setRiaKey(new BigDecimal("44"));
    when(activityRepository.findConflictingActivities(any(), any(), any()))
        .thenReturn(List.of(conflictingAct));

    // Do nothing on updates that WILL be invoked
    doNothing()
        .when(testResultRepository)
        .saveGerminatorTray(any(), any(), any(), any(), any(), any(), any());
    doNothing()
        .when(activityRepository)
        .updateActualBeginAndRevisedDates(
            any(BigDecimal.class),
            any(LocalDateTime.class),
            any(LocalDate.class),
            any(LocalDate.class));

    // Act
    List<GerminatorTrayCreateResponseDto> response =
        testResultService.assignGerminatorTrays(requests);

    // Assert: response present
    assertEquals(1, response.size());

    // Verify interactions
    verify(germinatorTrayRepository, times(1)).save(any());
    verify(testResultRepository, times(1))
        .saveGerminatorTray(any(), any(), any(), any(), any(), any(), any());
    // Verify that conflicts were actually checked
    verify(activityRepository, times(1)).findConflictingActivities(any(), any(), any());
    // Because a conflict exists, markSignificantAndCommit should NOT be called
    verify(activityRepository, never()).markSignificantAndCommit(any());
  }

  @Test
  void validation_rejects_nonGermTest_activityType() {
    String activityTypeCd = "X99";
    BigDecimal riaSkey = new BigDecimal("881900");

    List<GerminatorTrayCreateDto> requests =
        List.of(new GerminatorTrayCreateDto(activityTypeCd, riaSkey, null));

    // testRegimeRepository does NOT include the activity type -> not a germ test
    when(testRegimeRepository.findAllGermTestActivityTypeCodes()).thenReturn(List.of("G10", "G20"));
    // return a valid germTestResult so validation reaches the activity-type check
    GermTestResultDto validGerm =
        new GermTestResultDto(
            LocalDate.now().minusDays(10),
            48,
            LocalDate.now().minusDays(5),
            activityTypeCd,
            72,
            96,
            LocalDate.now().minusDays(1), // seed withdrawal is before today (valid)
            null // no germinator assigned
            );
    when(testResultRepository.getGermTestResult(riaSkey)).thenReturn(validGerm);

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class, () -> testResultService.assignGerminatorTrays(requests));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals(GERMINATOR_TRAY_VALIDATION_ERROR_MESSAGE, ex.getReason());
  }

  @Test
  void validation_rejects_seedWithdrawal_notBeforeToday() {
    String activityTypeCd = "G20";
    BigDecimal riaSkey = new BigDecimal("881901");

    List<GerminatorTrayCreateDto> requests =
        List.of(new GerminatorTrayCreateDto(activityTypeCd, riaSkey, null));

    // activity type is recognised as a germ test
    when(testRegimeRepository.findAllGermTestActivityTypeCodes())
        .thenReturn(List.of(activityTypeCd));

    // seedWithdrawDate in past but germinatorTrayId already set -> invalid
    GermTestResultDto germTestResult =
        new GermTestResultDto(
            LocalDate.now().minusDays(10),
            48,
            LocalDate.now().minusDays(5),
            activityTypeCd,
            72,
            96,
            LocalDate.now().minusDays(1), // ← Change from .plusDays(1)
            123 // already assigned
            );
    when(testResultRepository.getGermTestResult(riaSkey)).thenReturn(germTestResult);

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class, () -> testResultService.assignGerminatorTrays(requests));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals(GERMINATOR_TRAY_VALIDATION_ERROR_MESSAGE, ex.getReason());
  }

  @Test
  void validation_rejects_whenGerminatorIdAlreadyAssigned() {
    String activityTypeCd = "G20";
    BigDecimal riaSkey = new BigDecimal("881902");

    List<GerminatorTrayCreateDto> requests =
        List.of(new GerminatorTrayCreateDto(activityTypeCd, riaSkey, null));

    // activity type is recognised
    when(testRegimeRepository.findAllGermTestActivityTypeCodes())
        .thenReturn(List.of(activityTypeCd));

    // seedWithdrawDate in past but germinatorTrayId already set -> invalid
    GermTestResultDto germTestResult =
        new GermTestResultDto(
            LocalDate.now().minusDays(10),
            48,
            LocalDate.now().minusDays(5),
            activityTypeCd,
            72,
            96,
            LocalDate.now().plusDays(1),
            123 // already assigned
            );
    when(testResultRepository.getGermTestResult(riaSkey)).thenReturn(germTestResult);

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class, () -> testResultService.assignGerminatorTrays(requests));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals(GERMINATOR_TRAY_VALIDATION_ERROR_MESSAGE, ex.getReason());
  }

  private void setRepAbnormalValues(DailyAbnormalEntity entity, int rep, int start) {
    switch (rep) {
      case 1 -> {
        entity.setRep1NoAbnrmRe(start);
        entity.setRep1NoAbnrmSr(start + 1);
        entity.setRep1NoAbnrmSh(start + 2);
        entity.setRep1NoAbnrmRn(start + 3);
        entity.setRep1NoAbnrmTh(start + 4);
        entity.setRep1NoAbnrmTr(start + 5);
        entity.setRep1NoAbnrmTw(start + 6);
        entity.setRep1NoAbnrmCm(start + 7);
        entity.setRep1NoAbnrmWeak(start + 8);
        entity.setRep1NoAbnrmOther(start + 9);
        entity.setRep1NoAbnrmPrgrm(start + 10);
      }
      case 2 -> {
        entity.setRep2NoAbnrmRe(start);
        entity.setRep2NoAbnrmSr(start + 1);
        entity.setRep2NoAbnrmSh(start + 2);
        entity.setRep2NoAbnrmRn(start + 3);
        entity.setRep2NoAbnrmTh(start + 4);
        entity.setRep2NoAbnrmTr(start + 5);
        entity.setRep2NoAbnrmTw(start + 6);
        entity.setRep2NoAbnrmCm(start + 7);
        entity.setRep2NoAbnrmWeak(start + 8);
        entity.setRep2NoAbnrmOther(start + 9);
        entity.setRep2NoAbnrmPrgrm(start + 10);
      }
      case 3 -> {
        entity.setRep3NoAbnrmRe(start);
        entity.setRep3NoAbnrmSr(start + 1);
        entity.setRep3NoAbnrmSh(start + 2);
        entity.setRep3NoAbnrmRn(start + 3);
        entity.setRep3NoAbnrmTh(start + 4);
        entity.setRep3NoAbnrmTr(start + 5);
        entity.setRep3NoAbnrmTw(start + 6);
        entity.setRep3NoAbnrmCm(start + 7);
        entity.setRep3NoAbnrmWeak(start + 8);
        entity.setRep3NoAbnrmOther(start + 9);
        entity.setRep3NoAbnrmPrgrm(start + 10);
      }
      case 4 -> {
        entity.setRep4NoAbnrmRe(start);
        entity.setRep4NoAbnrmSr(start + 1);
        entity.setRep4NoAbnrmSh(start + 2);
        entity.setRep4NoAbnrmRn(start + 3);
        entity.setRep4NoAbnrmTh(start + 4);
        entity.setRep4NoAbnrmTr(start + 5);
        entity.setRep4NoAbnrmTw(start + 6);
        entity.setRep4NoAbnrmCm(start + 7);
        entity.setRep4NoAbnrmWeak(start + 8);
        entity.setRep4NoAbnrmOther(start + 9);
        entity.setRep4NoAbnrmPrgrm(start + 10);
      }
      default -> throw new IllegalArgumentException("rep must be 1..4");
    }
  }

  @Test
  void getDailyAbnormalCounts_returnsResponseDto_whenDataValid() throws Exception {
    // Happy path test
    BigDecimal dailyGermSkey = new BigDecimal("12345");

    DailyAbnormalEntity entity = new DailyAbnormalEntity();
    entity.setDailyGermSkey(dailyGermSkey);

    BigDecimal riaSkey = new BigDecimal("881191");

    GermCountEntity germCount = new GermCountEntity();
    germCount.setRiaSkey(riaSkey);
    germCount.setDailyGermSkey1(dailyGermSkey);

    // Keep germinated totals low so cross-check passes against total seeds (100).
    germCount.setRep1NoSeedsGerm1(10);
    germCount.setRep2NoSeedsGerm1(10);
    germCount.setRep3NoSeedsGerm1(10);
    germCount.setRep4NoSeedsGerm1(10);

    when(dailyAbnormalRepository.findByDailyGermSkey(dailyGermSkey)).thenReturn(entity);
    when(germCountRepository.findByDailyGermSkeyInAnySlot(dailyGermSkey))
        .thenReturn(Optional.of(germCount));
    when(testRepGermRepository.findByRiaKeyOrderByReplicateNumber(riaSkey))
        .thenReturn(
            List.of(
                makeReplicate(riaSkey, 1, 100),
                makeReplicate(riaSkey, 2, 100),
                makeReplicate(riaSkey, 3, 100),
                makeReplicate(riaSkey, 4, 100)));

    setRepAbnormalValues(entity, 1, 0);
    setRepAbnormalValues(entity, 2, 1);
    setRepAbnormalValues(entity, 3, 2);
    setRepAbnormalValues(entity, 4, 3);

    DailyAbnormalResponseDto actual = testResultService.getDailyAbnormalCounts(dailyGermSkey);
    assertNotNull(actual);
    assertEquals(dailyGermSkey, actual.dailyGermSkey());
    assertEquals(0, actual.rep1().abnormalNumReverseEmbryo());
    assertEquals(10, actual.rep2().abnormalNumOther());
    assertEquals(8, actual.rep3().abnormalNumTwisted());
    assertEquals(10, actual.rep4().abnormalNumMegametophyteCollar());

    verify(dailyAbnormalRepository, times(1)).findByDailyGermSkey(dailyGermSkey);
  }

  @Test
  void getDailyAbnormalCounts_throws400_whenDailyGermSkeyNull() {
    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class, () -> testResultService.getDailyAbnormalCounts(null));

    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals("dailyGermSkey is required", ex.getReason());
    verify(dailyAbnormalRepository, never()).findByDailyGermSkey(any());
  }

  @Test
  void getDailyAbnormalCounts_throws404_whenEntityNotFound() {
    BigDecimal dailyGermSkey = new BigDecimal("12345");
    when(dailyAbnormalRepository.findByDailyGermSkey(dailyGermSkey)).thenReturn(null);

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> testResultService.getDailyAbnormalCounts(dailyGermSkey));

    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    assertEquals("Daily abnormal counts not found for the given key", ex.getReason());
    verify(dailyAbnormalRepository, times(1)).findByDailyGermSkey(dailyGermSkey);
  }

  @Test
  void getDailyAbnormalCounts_throws422_whenAbnormalCountNegative() {
    BigDecimal dailyGermSkey = new BigDecimal("12345");
    BigDecimal riaSkey = new BigDecimal("881191");

    DailyAbnormalEntity entity = new DailyAbnormalEntity();
    entity.setDailyGermSkey(dailyGermSkey);

    // keep values modest; this test is about negativity, not overflow
    setRepAbnormalValues(entity, 1, 0);
    setRepAbnormalValues(entity, 2, 0);
    setRepAbnormalValues(entity, 3, 0);
    setRepAbnormalValues(entity, 4, 0);

    // Make one value invalid to trigger 422
    entity.setRep3NoAbnrmTw(-1);

    GermCountEntity germCount = new GermCountEntity();
    germCount.setRiaSkey(riaSkey);
    germCount.setDailyGermSkey1(dailyGermSkey);

    when(dailyAbnormalRepository.findByDailyGermSkey(dailyGermSkey)).thenReturn(entity);
    when(germCountRepository.findByDailyGermSkeyInAnySlot(dailyGermSkey))
        .thenReturn(Optional.of(germCount));
    when(testRepGermRepository.findByRiaKeyOrderByReplicateNumber(riaSkey))
        .thenReturn(
            List.of(
                makeReplicate(riaSkey, 1, 100),
                makeReplicate(riaSkey, 2, 100),
                makeReplicate(riaSkey, 3, 100),
                makeReplicate(riaSkey, 4, 100)));

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> testResultService.getDailyAbnormalCounts(dailyGermSkey));

    assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, ex.getStatusCode());
    assertTrue(ex.getReason().contains("rep3"));
    assertTrue(ex.getReason().contains("abnormalNumTwisted"));
    verify(dailyAbnormalRepository, times(1)).findByDailyGermSkey(dailyGermSkey);
  }

  @Test
  void getDailyAbnormalCounts_throws422_whenGerminatedPlusAbnormalExceedsTotalSeeds() {
    BigDecimal dailyGermSkey = new BigDecimal("12345");
    BigDecimal riaSkey = new BigDecimal("881191");

    DailyAbnormalEntity abnormal = new DailyAbnormalEntity();
    abnormal.setDailyGermSkey(dailyGermSkey);

    // rep1 abnormal total = 20, others 0
    setAllAbnormalCountsToZero(abnormal);
    abnormal.setRep1NoAbnrmRe(20);

    GermCountEntity germCount = new GermCountEntity();
    germCount.setRiaSkey(riaSkey);
    germCount.setDailyGermSkey1(dailyGermSkey);
    germCount.setRep1NoSeedsGerm1(90); // germinated total for rep1 = 90
    germCount.setRep2NoSeedsGerm1(0);
    germCount.setRep3NoSeedsGerm1(0);
    germCount.setRep4NoSeedsGerm1(0);

    when(dailyAbnormalRepository.findByDailyGermSkey(dailyGermSkey)).thenReturn(abnormal);
    when(germCountRepository.findByDailyGermSkeyInAnySlot(dailyGermSkey))
        .thenReturn(Optional.of(germCount));
    when(testRepGermRepository.findByRiaKeyOrderByReplicateNumber(riaSkey))
        .thenReturn(
            List.of(
                makeReplicate(riaSkey, 1, 100),
                makeReplicate(riaSkey, 2, 100),
                makeReplicate(riaSkey, 3, 100),
                makeReplicate(riaSkey, 4, 100)));

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> testResultService.getDailyAbnormalCounts(dailyGermSkey));

    assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, ex.getStatusCode());
    assertTrue(ex.getReason().contains("rep1"));
    assertTrue(ex.getReason().contains("exceeds total seeds"));
  }

  @Test
  void getDailyAbnormalCounts_throws422_whenRep1GerminatedTotalExceedsTotalSeeds() {
    BigDecimal dailyGermSkey = new BigDecimal("12345");
    BigDecimal riaSkey = new BigDecimal("881191");

    DailyAbnormalEntity abnormal = new DailyAbnormalEntity();
    abnormal.setDailyGermSkey(dailyGermSkey);
    setAllAbnormalCountsToZero(abnormal);

    GermCountEntity germCount = new GermCountEntity();
    germCount.setRiaSkey(riaSkey);
    germCount.setDailyGermSkey1(dailyGermSkey);
    germCount.setRep1NoSeedsGerm1(101); // > 100
    germCount.setRep2NoSeedsGerm1(0);
    germCount.setRep3NoSeedsGerm1(0);
    germCount.setRep4NoSeedsGerm1(0);

    when(dailyAbnormalRepository.findByDailyGermSkey(dailyGermSkey)).thenReturn(abnormal);
    when(germCountRepository.findByDailyGermSkeyInAnySlot(dailyGermSkey))
        .thenReturn(Optional.of(germCount));
    when(testRepGermRepository.findByRiaKeyOrderByReplicateNumber(riaSkey))
        .thenReturn(
            List.of(
                makeReplicate(riaSkey, 1, 100),
                makeReplicate(riaSkey, 2, 100),
                makeReplicate(riaSkey, 3, 100),
                makeReplicate(riaSkey, 4, 100)));

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> testResultService.getDailyAbnormalCounts(dailyGermSkey));

    assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, ex.getStatusCode());
    assertTrue(ex.getReason().contains("rep1"));
    assertTrue(ex.getReason().contains("germinated total exceeds total seeds"));
  }

  @Test
  void getDailyAbnormalCounts_throws422_whenReplicateRowsLessThanFour() {
    BigDecimal dailyGermSkey = new BigDecimal("12345");
    BigDecimal riaSkey = new BigDecimal("881191");

    DailyAbnormalEntity abnormal = new DailyAbnormalEntity();
    abnormal.setDailyGermSkey(dailyGermSkey);
    setAllAbnormalCountsToZero(abnormal);

    GermCountEntity germCount = new GermCountEntity();
    germCount.setRiaSkey(riaSkey);
    germCount.setDailyGermSkey1(dailyGermSkey);

    when(dailyAbnormalRepository.findByDailyGermSkey(dailyGermSkey)).thenReturn(abnormal);
    when(germCountRepository.findByDailyGermSkeyInAnySlot(dailyGermSkey))
        .thenReturn(Optional.of(germCount));
    when(testRepGermRepository.findByRiaKeyOrderByReplicateNumber(riaSkey))
        .thenReturn(
            List.of(
                makeReplicate(riaSkey, 1, 100),
                makeReplicate(riaSkey, 2, 100),
                makeReplicate(riaSkey, 3, 100))); // only 3 rows

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> testResultService.getDailyAbnormalCounts(dailyGermSkey));

    assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, ex.getStatusCode());
    assertEquals(
        "Unable to validate replicate totals: missing replicate seed totals", ex.getReason());

    verify(dailyAbnormalRepository, times(1)).findByDailyGermSkey(dailyGermSkey);
    verify(germCountRepository, times(1)).findByDailyGermSkeyInAnySlot(dailyGermSkey);
    verify(testRepGermRepository, times(1)).findByRiaKeyOrderByReplicateNumber(riaSkey);
  }

  @Test
  void getDailyAbnormalCounts_throws422_whenReplicateNumbersAre1235() {
    BigDecimal dailyGermSkey = new BigDecimal("12345");
    BigDecimal riaSkey = new BigDecimal("881191");

    DailyAbnormalEntity abnormal = new DailyAbnormalEntity();
    abnormal.setDailyGermSkey(dailyGermSkey);

    GermCountEntity germCount = new GermCountEntity();
    germCount.setRiaSkey(riaSkey);
    germCount.setDailyGermSkey1(dailyGermSkey);

    when(dailyAbnormalRepository.findByDailyGermSkey(dailyGermSkey)).thenReturn(abnormal);
    when(germCountRepository.findByDailyGermSkeyInAnySlot(dailyGermSkey))
        .thenReturn(Optional.of(germCount));
    when(testRepGermRepository.findByRiaKeyOrderByReplicateNumber(riaSkey))
        .thenReturn(
            List.of(
                makeReplicate(riaSkey, 1, 100),
                makeReplicate(riaSkey, 2, 100),
                makeReplicate(riaSkey, 3, 100),
                makeReplicate(riaSkey, 5, 100)));

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> testResultService.getDailyAbnormalCounts(dailyGermSkey));

    assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, ex.getStatusCode());
    assertEquals(
        "Unable to validate replicate totals: missing replicate seed totals", ex.getReason());

    verify(dailyAbnormalRepository, times(1)).findByDailyGermSkey(dailyGermSkey);
    verify(germCountRepository, times(1)).findByDailyGermSkeyInAnySlot(dailyGermSkey);
    verify(testRepGermRepository, times(1)).findByRiaKeyOrderByReplicateNumber(riaSkey);
  }

  @Test
  void getDailyAbnormalCounts_treatsNullAsZero_forGerminatedAndAbnormalCounts() {
    BigDecimal dailyGermSkey = new BigDecimal("12345");
    BigDecimal riaSkey = new BigDecimal("881191");

    DailyAbnormalEntity abnormal = new DailyAbnormalEntity();
    abnormal.setDailyGermSkey(dailyGermSkey);
    // leave all abnormal fields null intentionally

    GermCountEntity germCount = new GermCountEntity();
    germCount.setRiaSkey(riaSkey);
    germCount.setDailyGermSkey1(dailyGermSkey);
    // leave all repXNoSeedsGermY null intentionally

    when(dailyAbnormalRepository.findByDailyGermSkey(dailyGermSkey)).thenReturn(abnormal);
    when(germCountRepository.findByDailyGermSkeyInAnySlot(dailyGermSkey))
        .thenReturn(Optional.of(germCount));
    when(testRepGermRepository.findByRiaKeyOrderByReplicateNumber(riaSkey))
        .thenReturn(
            List.of(
                makeReplicate(riaSkey, 1, 100),
                makeReplicate(riaSkey, 2, 100),
                makeReplicate(riaSkey, 3, 100),
                makeReplicate(riaSkey, 4, 100)));

    DailyAbnormalResponseDto result = testResultService.getDailyAbnormalCounts(dailyGermSkey);

    assertNotNull(result);
    assertEquals(dailyGermSkey, result.dailyGermSkey());
  }

  @Test
  void determineTestRank_returnsA_whenStdAcceptedAndNoAcceptedStdRankA_Exists() {
    String seedlotNumber = "12345";

    when(testResultRepository.countAcceptedStdRankA(seedlotNumber)).thenReturn(0L);

    String result = testResultService.determineTestRank(seedlotNumber, "STD", 1);

    assertEquals("A", result);
    verify(testResultRepository).countAcceptedStdRankA(seedlotNumber);
  }

  @Test
  void determineTestRank_returnsP_whenStdAcceptedAndAcceptedStdRankA_Exists() {
    String seedlotNumber = "12345";

    when(testResultRepository.countAcceptedStdRankA(seedlotNumber)).thenReturn(2L);

    String result = testResultService.determineTestRank(seedlotNumber, "STD", 1);

    assertEquals("P", result);
    verify(testResultRepository).countAcceptedStdRankA(seedlotNumber);
  }

  @Test
  void determineTestRank_returnsNull_whenCategoryIsNotStd() {
    String seedlotNumber = "12345";

    String result = testResultService.determineTestRank(seedlotNumber, "TST", 1);

    assertNull(result);
    verify(testResultRepository, never()).countAcceptedStdRankA(any());
  }

  @Test
  void determineTestRank_returnsNull_whenAcceptResultIsNotOne() {
    String seedlotNumber = "12345";

    String result = testResultService.determineTestRank(seedlotNumber, "STD", 0);

    assertNull(result);
    verify(testResultRepository, never()).countAcceptedStdRankA(any());
  }

  @Test
  void determineTestRank_throwsBadRequest_whenSeedlotIsBlank() {
    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> testResultService.determineTestRank(" ", "STD", 1));

    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals("seedlotNumber is required", ex.getReason());
    verify(testResultRepository, never()).countAcceptedStdRankA(any());
  }

  @Test
  @DisplayName("getGerminationTestHeader should return DTO when riaKey exists")
  void getGerminationTestHeader_shouldSucceed() {
    BigDecimal riaKey = new BigDecimal("1234567890");

    GerminationTestHeaderDto dto = createHeaderDto(riaKey);

    when(testResultRepository.findGerminationTestHeaderByRiaKey(riaKey))
        .thenReturn(Optional.of(dto));
    when(testRegimeRepository.findById("G64"))
        .thenReturn(Optional.of(createRegimeWithSoakHours("G64", 12)));

    GerminationTestHeaderDto result = testResultService.getGerminationTestHeader(riaKey);

    assertEquals(LocalDateTime.parse("2026-04-15T20:30:00"), result.soakEndDate());
    assertEquals("G64", result.activityTypeCd());
    assertEquals("TSC", result.requestTypeSt());
  }

  @Test
  @DisplayName("getGerminationTestHeader should throw 404 when riaKey is not found")
  void getGerminationTestHeader_shouldThrowNotFound() {
    BigDecimal riaKey = new BigDecimal("9999999999");

    when(testResultRepository.findGerminationTestHeaderByRiaKey(riaKey))
        .thenReturn(Optional.empty());

    ResponseStatusException exception =
        assertThrows(
            ResponseStatusException.class,
            () -> testResultService.getGerminationTestHeader(riaKey));

    assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    assertEquals("No germination test data found for given RIA_SKEY", exception.getReason());
  }

  @Test
  @DisplayName(
      "getGerminationTestHeader should throw data integrity error when multiple rows are returned")
  void getGerminationTestHeader_shouldThrowDataIntegrityViolation() {
    BigDecimal riaKey = new BigDecimal("1234567890");

    when(testResultRepository.findGerminationTestHeaderByRiaKey(riaKey))
        .thenThrow(new IncorrectResultSizeDataAccessException(1));

    DataIntegrityViolationException exception =
        assertThrows(
            DataIntegrityViolationException.class,
            () -> testResultService.getGerminationTestHeader(riaKey));

    assertEquals(
        "Expected exactly one germination test row for RIA_SKEY " + riaKey, exception.getMessage());
  }

  private GerminationTestHeaderDto createHeaderDto(BigDecimal riaKey) {
    return new GerminationTestHeaderDto(
        riaKey, // riaSkey
        "G64", // activityTypeCd
        LocalDateTime.parse("2026-04-15T08:30:00"), // actualBeginDtTm
        LocalDateTime.parse("2026-04-18T16:00:00"), // actualEndDtTm
        "TST", // testCategoryCd
        "MOI", // moistureStatusCd
        "Primary sample", // sampleDesc
        1, // acceptResultInd
        1, // testCompleteInd
        "Test comment", // riaComment
        1, // standardTestInd
        "A", // testRank
        95, // germinationPct
        90, // germinationValue
        88, // peakValueGrmPct
        14, // peakValueNoDays
        LocalDate.parse("2026-04-10"), // seedWithdrawalDate
        LocalDate.parse("2026-04-01"), // revisedStartDt
        LocalDate.parse("2026-04-20"), // revisedEndDt
        72, // activityDuration
        "HRS", // actvtyTmUnitSt
        LocalDate.parse("2026-03-20"), // stratStartDt
        LocalDate.parse("2026-03-25"), // drybackStartDate
        LocalDate.parse("2026-03-22"), // warmStratStartDate
        LocalDate.parse("2026-03-30"), // germinatorEntry
        101, // germinatorTrayId
        "1", // germinatorId
        null, // soakEndDate computed in service
        new BigDecimal("12.345"), // imbibedWt
        new BigDecimal("10.220"), // dryWeight
        new BigDecimal("9.880"), // drybackWeight
        0, // intrmdtCleanrInd
        "TSC" // requestTypeSt
        );
  }

  private TestRegimeEntity createRegimeWithSoakHours(String seedlotTestCode, Integer soakHours) {
    TestRegimeEntity regime = new TestRegimeEntity();
    regime.setSeedlotTestCode(seedlotTestCode);
    regime.setSoakHours(soakHours);
    return regime;
  }

  private TestRepGermEntity makeReplicate(BigDecimal riaSkey, int repNo, int totalSeeds) {
    TestRepGermEntity rep = new TestRepGermEntity();
    rep.setId(new ReplicateId(riaSkey, repNo));
    rep.setTotalNoSeeds(totalSeeds);
    return rep;
  }

  /*---------------------- updateGerminationTest validations ---------------------------------*/

  private static final BigDecimal RIA_KEY = new BigDecimal("1234");
  private static final LocalDateTime TST_TS = LocalDateTime.of(2026, 5, 1, 10, 0);
  private static final LocalDateTime RIA_TS = LocalDateTime.of(2026, 5, 1, 11, 0);

  private TestResultEntity storedTest(Integer completeInd, String category) {
    TestResultEntity entity = new TestResultEntity();
    entity.setRiaKey(RIA_KEY);
    entity.setActivityType("G23");
    entity.setTestCategory(category);
    entity.setTestCompleteInd(completeInd);
    entity.setUpdateTimestamp(TST_TS);
    return entity;
  }

  private ActivityEntity storedActivity() {
    ActivityEntity activity = new ActivityEntity();
    activity.setRiaKey(RIA_KEY);
    activity.setSeedlotNumber("60001");
    activity.setRequestSkey(new BigDecimal("9001"));
    activity.setItemId("A");
    activity.setActivityDuration(21);
    activity.setActivityTimeUnit("DY");
    activity.setUpdateTimestamp(RIA_TS);
    return activity;
  }

  private GerminationTestUpdateFormDto updateDto(
      Boolean accept, Boolean complete,
      LocalDateTime begin, LocalDateTime end, String comment) {
    return new GerminationTestUpdateFormDto(
        "STD", accept, complete, "A", LocalDate.of(2026, 4, 30),
        begin, end, comment, false, TST_TS, RIA_TS);
  }

  @Test
  void updateGerminationTest_unknownRiaKey_throwsNotFound() {
    when(testResultRepository.findById(RIA_KEY)).thenReturn(Optional.empty());

    ResponseStatusException exc = assertThrows(
        ResponseStatusException.class,
        () -> testResultService.updateGerminationTest(
            RIA_KEY,
            updateDto(false, false, LocalDateTime.of(2026, 5, 2, 8, 0), null, null)));

    assertEquals(HttpStatus.NOT_FOUND, exc.getStatusCode());
  }

  @Test
  void updateGerminationTest_acceptWithoutComplete_throwsUnprocessable() {
    when(testResultRepository.findById(RIA_KEY))
        .thenReturn(Optional.of(storedTest(0, "STD")));
    when(activityRepository.findById(RIA_KEY))
        .thenReturn(Optional.of(storedActivity()));

    ResponseStatusException exc = assertThrows(
        ResponseStatusException.class,
        () -> testResultService.updateGerminationTest(
            RIA_KEY,
            updateDto(true, false, LocalDateTime.of(2026, 5, 2, 8, 0), null, null)));

    assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, exc.getStatusCode());
  }

  @Test
  void updateGerminationTest_completeWithoutBeginDate_throwsUnprocessable() {
    when(testResultRepository.findById(RIA_KEY))
        .thenReturn(Optional.of(storedTest(0, "STD")));
    when(activityRepository.findById(RIA_KEY))
        .thenReturn(Optional.of(storedActivity()));

    ResponseStatusException exc = assertThrows(
        ResponseStatusException.class,
        () -> testResultService.updateGerminationTest(
            RIA_KEY, updateDto(false, true, null, null, null)));

    assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, exc.getStatusCode());
  }

  @Test
  void updateGerminationTest_commentWithoutBeginDate_throwsUnprocessable() {
    when(testResultRepository.findById(RIA_KEY))
        .thenReturn(Optional.of(storedTest(0, "STD")));
    when(activityRepository.findById(RIA_KEY))
        .thenReturn(Optional.of(storedActivity()));

    ResponseStatusException exc = assertThrows(
        ResponseStatusException.class,
        () -> testResultService.updateGerminationTest(
            RIA_KEY, updateDto(false, false, null, null, "a comment")));

    assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, exc.getStatusCode());
  }

  @Test
  void updateGerminationTest_endNotAfterBegin_throwsUnprocessable() {
    when(testResultRepository.findById(RIA_KEY))
        .thenReturn(Optional.of(storedTest(0, "STD")));
    when(activityRepository.findById(RIA_KEY))
        .thenReturn(Optional.of(storedActivity()));

    LocalDateTime begin = LocalDateTime.of(2026, 5, 10, 8, 0);
    ResponseStatusException exc = assertThrows(
        ResponseStatusException.class,
        () -> testResultService.updateGerminationTest(
            RIA_KEY, updateDto(false, false, begin, begin.minusDays(1), null)));

    assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, exc.getStatusCode());
  }

  @Test
  void updateGerminationTest_beginInFuture_throwsUnprocessable() {
    when(testResultRepository.findById(RIA_KEY))
        .thenReturn(Optional.of(storedTest(0, "STD")));
    when(activityRepository.findById(RIA_KEY))
        .thenReturn(Optional.of(storedActivity()));

    ResponseStatusException exc = assertThrows(
        ResponseStatusException.class,
        () -> testResultService.updateGerminationTest(
            RIA_KEY,
            updateDto(false, false, LocalDateTime.of(2099, 1, 1, 0, 0), null, null)));

    assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, exc.getStatusCode());
  }

  @Test
  void updateGerminationTest_categoryChangeOnCompletedTest_throwsUnprocessable() {
    when(testResultRepository.findById(RIA_KEY))
        .thenReturn(Optional.of(storedTest(-1, "QA")));
    when(activityRepository.findById(RIA_KEY))
        .thenReturn(Optional.of(storedActivity()));

    // dto category is STD, stored is QA and test already complete
    ResponseStatusException exc = assertThrows(
        ResponseStatusException.class,
        () -> testResultService.updateGerminationTest(
            RIA_KEY,
            updateDto(false, true,
                LocalDateTime.of(2026, 5, 2, 8, 0),
                LocalDateTime.of(2026, 5, 20, 8, 0), null)));

    assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, exc.getStatusCode());
  }

  /*---------------------- updateGerminationTest update flow ---------------------------------*/

  private GerminationTestHeaderDto headerDto() {
    return new GerminationTestHeaderDto(
        RIA_KEY, "G23", null, null, "STD", null, null, 0, 0, null, -1, null,
        null, null, null, null, null, null, null, 21, "DY", null, null, null,
        null, null, null, null, null, null, null, null, "RTS");
  }

  private void mockHappyPathRepos() {
    when(testResultRepository.findById(RIA_KEY))
        .thenReturn(Optional.of(storedTest(0, "STD")));
    when(activityRepository.findById(RIA_KEY))
        .thenReturn(Optional.of(storedActivity()));
    when(testResultRepository.updateGerminationTestHeader(
        any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
        .thenReturn(1);
    when(activityRepository.updateGerminationTestActivity(
        any(), any(), any(), any(), any(), any(), any(), any()))
        .thenReturn(1);
    when(testResultRepository.findGerminationTestHeaderByRiaKey(RIA_KEY))
        .thenReturn(Optional.of(headerDto()));
  }

  @Test
  void updateGerminationTest_notAccepted_writesZeroFlagsAndNullRank() {
    mockHappyPathRepos();
    LocalDateTime begin = LocalDateTime.of(2026, 5, 2, 8, 0);

    testResultService.updateGerminationTest(RIA_KEY, updateDto(false, false, begin, null, null));

    verify(testResultRepository).updateGerminationTestHeader(
        eq(RIA_KEY), eq(0), eq(0), isNull(), eq(0), eq(0),
        eq("A"), eq(LocalDate.of(2026, 4, 30)), eq("STD"), eq(TST_TS));
    verify(testResultRepository, never()).resetOriginalTestIndForSiblings(
        any(), any(), any(), any());
    verify(testResultRepository, never()).resetCurrentTestIndForSiblings(
        any(), any(), any(), any());
  }

  @Test
  void updateGerminationTest_acceptedNoSiblings_setsOriginalCurrentAndRankA() {
    mockHappyPathRepos();
    when(testResultRepository.findMinCompletedAcceptedEndDate(any(), any(), any()))
        .thenReturn(null);
    when(testResultRepository.findMaxCompletedAcceptedEndDate(any(), any(), any()))
        .thenReturn(null);
    when(testResultRepository.findRankATestsBySeedlot("60001"))
        .thenReturn(List.of());
    LocalDateTime begin = LocalDateTime.of(2026, 5, 2, 8, 0);
    LocalDateTime end = LocalDateTime.of(2026, 5, 20, 16, 0);

    testResultService.updateGerminationTest(RIA_KEY, updateDto(true, true, begin, end, null));

    verify(testResultRepository).updateGerminationTestHeader(
        eq(RIA_KEY), eq(-1), eq(-1), eq("A"), eq(-1), eq(-1),
        eq("A"), eq(LocalDate.of(2026, 4, 30)), eq("STD"), eq(TST_TS));
    verify(testResultRepository).resetOriginalTestIndForSiblings(
        RIA_KEY, "G23", "STD", "60001");
    verify(testResultRepository).resetCurrentTestIndForSiblings(
        RIA_KEY, "G23", "STD", "60001");
  }

  @Test
  void updateGerminationTest_acceptedBetweenSiblingEnds_keepsFlagsZero() {
    mockHappyPathRepos();
    when(testResultRepository.findMinCompletedAcceptedEndDate(any(), any(), any()))
        .thenReturn(LocalDateTime.of(2026, 5, 1, 0, 0));
    when(testResultRepository.findMaxCompletedAcceptedEndDate(any(), any(), any()))
        .thenReturn(LocalDateTime.of(2026, 5, 30, 0, 0));
    when(testResultRepository.findRankATestsBySeedlot("60001"))
        .thenReturn(List.of());
    LocalDateTime begin = LocalDateTime.of(2026, 5, 2, 8, 0);
    LocalDateTime end = LocalDateTime.of(2026, 5, 20, 16, 0);

    testResultService.updateGerminationTest(RIA_KEY, updateDto(true, true, begin, end, null));

    verify(testResultRepository).updateGerminationTestHeader(
        eq(RIA_KEY), eq(0), eq(0), isNull(), eq(-1), eq(-1),
        eq("A"), eq(LocalDate.of(2026, 4, 30)), eq("STD"), eq(TST_TS));
  }

  @Test
  void updateGerminationTest_acceptedLatestEnd_replacesCurrentRankA() {
    mockHappyPathRepos();
    when(testResultRepository.findMinCompletedAcceptedEndDate(any(), any(), any()))
        .thenReturn(LocalDateTime.of(2026, 5, 1, 0, 0));
    when(testResultRepository.findMaxCompletedAcceptedEndDate(any(), any(), any()))
        .thenReturn(LocalDateTime.of(2026, 5, 10, 0, 0));
    TestResultEntity otherRankA = new TestResultEntity();
    otherRankA.setRiaKey(new BigDecimal("9999"));
    otherRankA.setCurrentTest(-1);
    when(testResultRepository.findRankATestsBySeedlot("60001"))
        .thenReturn(List.of(otherRankA));
    LocalDateTime begin = LocalDateTime.of(2026, 5, 2, 8, 0);
    LocalDateTime end = LocalDateTime.of(2026, 5, 20, 16, 0);

    testResultService.updateGerminationTest(RIA_KEY, updateDto(true, true, begin, end, null));

    verify(testResultRepository).updateGerminationTestHeader(
        eq(RIA_KEY), eq(0), eq(-1), eq("A"), eq(-1), eq(-1),
        eq("A"), eq(LocalDate.of(2026, 4, 30)), eq("STD"), eq(TST_TS));
    verify(testResultRepository).resetCurrentTestIndForSiblings(
        RIA_KEY, "G23", "STD", "60001");
    verify(testResultRepository, never()).resetOriginalTestIndForSiblings(
        any(), any(), any(), any());
  }

  @Test
  void updateGerminationTest_staleTestResultTimestamp_throwsConflict() {
    when(testResultRepository.findById(RIA_KEY))
        .thenReturn(Optional.of(storedTest(0, "STD")));
    when(activityRepository.findById(RIA_KEY))
        .thenReturn(Optional.of(storedActivity()));
    when(testResultRepository.updateGerminationTestHeader(
        any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
        .thenReturn(0);

    ResponseStatusException exc = assertThrows(
        ResponseStatusException.class,
        () -> testResultService.updateGerminationTest(
            RIA_KEY, updateDto(false, false, LocalDateTime.of(2026, 5, 2, 8, 0), null, null)));

    assertEquals(HttpStatus.CONFLICT, exc.getStatusCode());
  }

  @Test
  void updateGerminationTest_staleActivityTimestamp_throwsConflict() {
    when(testResultRepository.findById(RIA_KEY))
        .thenReturn(Optional.of(storedTest(0, "STD")));
    when(activityRepository.findById(RIA_KEY))
        .thenReturn(Optional.of(storedActivity()));
    when(testResultRepository.updateGerminationTestHeader(
        any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
        .thenReturn(1);
    when(activityRepository.updateGerminationTestActivity(
        any(), any(), any(), any(), any(), any(), any(), any()))
        .thenReturn(0);

    ResponseStatusException exc = assertThrows(
        ResponseStatusException.class,
        () -> testResultService.updateGerminationTest(
            RIA_KEY, updateDto(false, false, LocalDateTime.of(2026, 5, 2, 8, 0), null, null)));

    assertEquals(HttpStatus.CONFLICT, exc.getStatusCode());
  }

  @Test
  void updateGerminationTest_incompleteWithoutEnd_derivesRevisedEndFromDuration() {
    mockHappyPathRepos();
    LocalDateTime begin = LocalDateTime.of(2026, 5, 2, 8, 0);

    testResultService.updateGerminationTest(RIA_KEY, updateDto(false, false, begin, null, null));

    verify(activityRepository).updateGerminationTestActivity(
        eq(RIA_KEY), eq(begin), isNull(),
        eq(begin.toLocalDate()),
        eq(begin.toLocalDate().plusDays(21)),
        isNull(), eq(0), eq(RIA_TS));
  }

  private void setAllAbnormalCountsToZero(DailyAbnormalEntity entity) {
    // rep1
    entity.setRep1NoAbnrmRe(0);
    entity.setRep1NoAbnrmSr(0);
    entity.setRep1NoAbnrmSh(0);
    entity.setRep1NoAbnrmRn(0);
    entity.setRep1NoAbnrmTh(0);
    entity.setRep1NoAbnrmTr(0);
    entity.setRep1NoAbnrmTw(0);
    entity.setRep1NoAbnrmCm(0);
    entity.setRep1NoAbnrmWeak(0);
    entity.setRep1NoAbnrmOther(0);
    entity.setRep1NoAbnrmPrgrm(0);

    // rep2
    entity.setRep2NoAbnrmRe(0);
    entity.setRep2NoAbnrmSr(0);
    entity.setRep2NoAbnrmSh(0);
    entity.setRep2NoAbnrmRn(0);
    entity.setRep2NoAbnrmTh(0);
    entity.setRep2NoAbnrmTr(0);
    entity.setRep2NoAbnrmTw(0);
    entity.setRep2NoAbnrmCm(0);
    entity.setRep2NoAbnrmWeak(0);
    entity.setRep2NoAbnrmOther(0);
    entity.setRep2NoAbnrmPrgrm(0);

    // rep3
    entity.setRep3NoAbnrmRe(0);
    entity.setRep3NoAbnrmSr(0);
    entity.setRep3NoAbnrmSh(0);
    entity.setRep3NoAbnrmRn(0);
    entity.setRep3NoAbnrmTh(0);
    entity.setRep3NoAbnrmTr(0);
    entity.setRep3NoAbnrmTw(0);
    entity.setRep3NoAbnrmCm(0);
    entity.setRep3NoAbnrmWeak(0);
    entity.setRep3NoAbnrmOther(0);
    entity.setRep3NoAbnrmPrgrm(0);

    // rep4
    entity.setRep4NoAbnrmRe(0);
    entity.setRep4NoAbnrmSr(0);
    entity.setRep4NoAbnrmSh(0);
    entity.setRep4NoAbnrmRn(0);
    entity.setRep4NoAbnrmTh(0);
    entity.setRep4NoAbnrmTr(0);
    entity.setRep4NoAbnrmTw(0);
    entity.setRep4NoAbnrmCm(0);
    entity.setRep4NoAbnrmWeak(0);
    entity.setRep4NoAbnrmOther(0);
    entity.setRep4NoAbnrmPrgrm(0);
  }
}
