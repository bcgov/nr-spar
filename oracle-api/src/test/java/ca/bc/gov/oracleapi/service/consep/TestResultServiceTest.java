package ca.bc.gov.oracleapi.service.consep;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.oracleapi.dto.consep.DailyAbnormalResponseDto;
import ca.bc.gov.oracleapi.dto.consep.GermTestResultDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayCreateDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayCreateResponseDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.entity.consep.DailyAbnormalEntity;
import ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.repository.consep.ActivityRepository;
import ca.bc.gov.oracleapi.repository.consep.DailyAbnormalRepository;
import ca.bc.gov.oracleapi.repository.consep.GerminatorTrayRepository;
import ca.bc.gov.oracleapi.repository.consep.TestRegimeRepository;
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * The test class for Test Result Service.
 */
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

    assertDoesNotThrow(() ->
        testResultService.updateTestResultStatusToCompleted(riaKey));
    verify(testResultRepository).updateTestResultStatusToCompleted(riaKey);
  }

  @Test
  void acceptTestResult_success() {
    when(testResultRepository.findById(riaKey)).thenReturn(Optional.of(testResultEntity));

    assertDoesNotThrow(() ->
        testResultService.acceptTestResult(riaKey));
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

    ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
        testResultService.acceptTestResult(riaKey));

    assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    assertEquals("Test is not completed", exception.getReason());
  }

  /*---------------------- Assign Germinator Trays ---------------------------------*/
  @Test
  void assignGerminatorTrays_shouldThrow_whenRequestsNullOrEmpty() {
    ResponseStatusException ex = assertThrows(ResponseStatusException.class,
        () -> testResultService.assignGerminatorTrays(null));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals("Create germinator tray request list cannot be null or empty", ex.getReason());

    ex = assertThrows(ResponseStatusException.class,
        () -> testResultService.assignGerminatorTrays(Collections.emptyList()));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
  }

  @Test
  void assignGerminatorTrays_createsTrays_andAssignsActivities() {
    // Arrange: 7 activities of two types -> expect 3 trays
    String activityTypeCdG10 = "G10";
    String activityTypeCdRts = "RTS";
    LocalDateTime now = LocalDateTime.now();
    final List<GerminatorTrayCreateDto> requests = List.of(
        new GerminatorTrayCreateDto(activityTypeCdG10, new BigDecimal("881191"), now.minusDays(2)),
        new GerminatorTrayCreateDto(activityTypeCdG10, new BigDecimal("881192"), now),
        new GerminatorTrayCreateDto(activityTypeCdG10, new BigDecimal("881193"), now.minusDays(1)),
        new GerminatorTrayCreateDto(activityTypeCdG10, new BigDecimal("881194"), now.minusDays(1)),
        new GerminatorTrayCreateDto(activityTypeCdG10, new BigDecimal("881195"), now.plusDays(2)),
        new GerminatorTrayCreateDto(activityTypeCdG10, new BigDecimal("881196"), now.plusDays(3)),
        new GerminatorTrayCreateDto(activityTypeCdRts, new BigDecimal("881197"), now.minusDays(4))
    );

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

    when(germinatorTrayRepository.save(any())).thenAnswer(inv -> {
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
    when(activityRepository.findById(any())).thenAnswer(inv -> {
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
    GermTestResultDto germTestResultDto = new GermTestResultDto(
        LocalDate.now(),
        48,
        LocalDate.now(),
        activityTypeCdG10,
        72,
        96,
        LocalDate.now().minusDays(1),
        null
    );
    when(testResultRepository.getGermTestResult(any())).thenReturn(germTestResultDto);

    // No conflicts for commit (always empty)
    when(activityRepository.findConflictingActivities(any(), any(), any()))
        .thenReturn(Collections.emptyList());

    // Do nothing for update methods
    doNothing().when(testResultRepository)
        .saveGerminatorTray(any(), any(), any(), any(), any(), any(), any());
    doNothing().when(testResultRepository).updateGerminatorTray(any(), any());
    doNothing().when(activityRepository).markSignificantAndCommit(any());
    doNothing().when(activityRepository)
        .updateActualBeginAndRevisedDates(any(), any(), any(), any());

    // Act
    List<GerminatorTrayCreateResponseDto> response =
        testResultService.assignGerminatorTrays(requests);

    // Assert: three trays created
    assertEquals(3, response.size());
    Set<Integer> returnedIds = new HashSet<>();
    response.forEach(r -> {
      // activityTypeCd should be either G10 or RTS (grouping key is used in responses)
      assertTrue(activityTypeCdG10.equals(r.activityTypeCd())
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
    final List<GerminatorTrayCreateDto> requests = List.of(
        new GerminatorTrayCreateDto(activityTypeCd, riaSkey, null)
    );

    // Stub tray save so service can proceed to activity lookup
    GerminatorTrayEntity savedTray = new GerminatorTrayEntity();
    savedTray.setGerminatorTrayId(555);
    savedTray.setActualStartDate(LocalDate.now().atStartOfDay());
    when(germinatorTrayRepository.save(any())).thenReturn(savedTray);

    // stub test regime codes
    when(testRegimeRepository.findAllGermTestActivityTypeCodes())
        .thenReturn(List.of(activityTypeCd));

    // return a valid germTestResult for validation to pass
    GermTestResultDto valid = new GermTestResultDto(
        LocalDate.now().minusDays(1),
        48,
        LocalDate.now(),
        activityTypeCd,
        72,
        96,
        LocalDate.now().minusDays(1),
        null
    );
    when(testResultRepository.getGermTestResult(riaSkey)).thenReturn(valid);

    // Activity not found
    when(activityRepository.findById(riaSkey)).thenReturn(Optional.empty());

    // Act / Assert
    ResponseStatusException ex = assertThrows(ResponseStatusException.class,
        () -> testResultService.assignGerminatorTrays(requests));

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
    final List<GerminatorTrayCreateDto> requests = List.of(
        new GerminatorTrayCreateDto(activityTypeCd, riaSkey, past)
    );

    // Ensure validation recognises this activity type as a germ test
    when(testRegimeRepository.findAllGermTestActivityTypeCodes())
        .thenReturn(List.of(activityTypeCd));

    // Validation will call getGermTestResult(...) and we want it to be missing (null) -> NOT_FOUND
    when(testResultRepository.getGermTestResult(riaSkey)).thenReturn(null);

    // Act / Assert
    ResponseStatusException ex = assertThrows(ResponseStatusException.class,
        () -> testResultService.assignGerminatorTrays(requests));

    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    assertEquals(String.format("No test result found for activity with RIA_SKEY %s", riaSkey),
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
    final List<GerminatorTrayCreateDto> requests = List.of(
        new GerminatorTrayCreateDto(activityTypeCd, riaSkey, LocalDateTime.now().minusDays(1))
    );

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
    GermTestResultDto germTestResultDto = new GermTestResultDto(
        LocalDate.now(),
        48,
        LocalDate.now(),
        activityTypeCd,
        72,
        96,
        LocalDate.now().minusDays(1),
        null
    );
    when(testResultRepository.getGermTestResult(any())).thenReturn(germTestResultDto);

    // Conflict found for this RTS activity
    ActivityEntity conflictingAct = new ActivityEntity();
    conflictingAct.setRiaKey(new BigDecimal("44"));
    when(activityRepository.findConflictingActivities(any(), any(), any()))
        .thenReturn(List.of(conflictingAct));

    // Do nothing on updates that WILL be invoked
    doNothing().when(testResultRepository)
        .saveGerminatorTray(any(), any(), any(), any(), any(), any(), any());
    doNothing().when(activityRepository).updateActualBeginAndRevisedDates(
        any(BigDecimal.class),
        any(LocalDateTime.class),
        any(LocalDate.class),
        any(LocalDate.class)
    );

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

    List<GerminatorTrayCreateDto> requests = List.of(
        new GerminatorTrayCreateDto(activityTypeCd, riaSkey, null)
    );

    // testRegimeRepository does NOT include the activity type -> not a germ test
    when(testRegimeRepository.findAllGermTestActivityTypeCodes()).thenReturn(List.of("G10", "G20"));
    // return a valid germTestResult so validation reaches the activity-type check
    GermTestResultDto validGerm = new GermTestResultDto(
        LocalDate.now().minusDays(10),
        48,
        LocalDate.now().minusDays(5),
        activityTypeCd,
        72,
        96,
        LocalDate.now().minusDays(1), // seed withdrawal in future
        null // no germinator assigned
    );
    when(testResultRepository.getGermTestResult(riaSkey)).thenReturn(validGerm);

    ResponseStatusException ex = assertThrows(ResponseStatusException.class,
        () -> testResultService.assignGerminatorTrays(requests));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals(GERMINATOR_TRAY_VALIDATION_ERROR_MESSAGE, ex.getReason());
  }

  @Test
  void validation_rejects_seedWithdrawal_notBeforeToday() {
    String activityTypeCd = "G20";
    BigDecimal riaSkey = new BigDecimal("881901");

    List<GerminatorTrayCreateDto> requests = List.of(
        new GerminatorTrayCreateDto(activityTypeCd, riaSkey, null)
    );

    // activity type is recognised as a germ test
    when(testRegimeRepository.findAllGermTestActivityTypeCodes())
        .thenReturn(List.of(activityTypeCd));

    // seedWithdrawDate is today -> invalid (must be before today)
    GermTestResultDto germTestResult = new GermTestResultDto(
        LocalDate.now().minusDays(10),
        48,
        LocalDate.now().minusDays(5),
        activityTypeCd,
        72,
        96,
        LocalDate.now(), // seed withdrawal is today (invalid)
        null
    );
    when(testResultRepository.getGermTestResult(riaSkey)).thenReturn(germTestResult);

    ResponseStatusException ex = assertThrows(ResponseStatusException.class,
        () -> testResultService.assignGerminatorTrays(requests));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals(GERMINATOR_TRAY_VALIDATION_ERROR_MESSAGE, ex.getReason());
  }

  @Test
  void validation_rejects_whenGerminatorIdAlreadyAssigned() {
    String activityTypeCd = "G20";
    BigDecimal riaSkey = new BigDecimal("881902");

    List<GerminatorTrayCreateDto> requests = List.of(
        new GerminatorTrayCreateDto(activityTypeCd, riaSkey, null)
    );

    // activity type is recognised
    when(testRegimeRepository.findAllGermTestActivityTypeCodes()).thenReturn(List.of(activityTypeCd));

    // seedWithdrawDate in past but germinatorTrayId already set -> invalid
    GermTestResultDto germTestResult = new GermTestResultDto(
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

    ResponseStatusException ex = assertThrows(ResponseStatusException.class,
        () -> testResultService.assignGerminatorTrays(requests));
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

    setRepAbnormalValues(entity, 1, 1);
    setRepAbnormalValues(entity, 2, 20);
    setRepAbnormalValues(entity, 3, 30);
    setRepAbnormalValues(entity, 4, 40);

    when(dailyAbnormalRepository.findByDailyGermSkey(dailyGermSkey)).thenReturn(entity);
    DailyAbnormalResponseDto actual = testResultService.getDailyAbnormalCounts(dailyGermSkey);
    assertNotNull(actual);
    assertEquals(dailyGermSkey, actual.dailyGermSkey());
    assertEquals(1, actual.rep1().abnormalNumReverseEmbryo());
    assertEquals(29, actual.rep2().abnormalNumOther());
    assertEquals(36, actual.rep3().abnormalNumTwisted());
    assertEquals(47, actual.rep4().abnormalNumMegametophyteCollar());

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

    DailyAbnormalEntity entity = new DailyAbnormalEntity();
    entity.setDailyGermSkey(dailyGermSkey);

    setRepAbnormalValues(entity, 1, 1);
    setRepAbnormalValues(entity, 2, 20);
    setRepAbnormalValues(entity, 3, 30);
    setRepAbnormalValues(entity, 4, 40);

    // Make one value invalid to trigger 422
    entity.setRep3NoAbnrmTw(-1);

    when(dailyAbnormalRepository.findByDailyGermSkey(dailyGermSkey)).thenReturn(entity);

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> testResultService.getDailyAbnormalCounts(dailyGermSkey));

    assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, ex.getStatusCode());
    assertTrue(ex.getReason().contains("rep3"));
    assertTrue(ex.getReason().contains("abnormalNumTwisted"));
    verify(dailyAbnormalRepository, times(1)).findByDailyGermSkey(dailyGermSkey);
  }
}
