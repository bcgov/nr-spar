package ca.bc.gov.oracleapi.service.consep;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;


import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayCreateDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayCreateResponseDto;
import ca.bc.gov.oracleapi.dto.consep.TestResultDatesDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.repository.consep.ActivityRepository;
import ca.bc.gov.oracleapi.repository.consep.GerminatorTrayRepository;
import ca.bc.gov.oracleapi.repository.consep.TestResultRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
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

  @Autowired
  @InjectMocks
  private TestResultService testResultService;

  private BigDecimal riaKey;
  private TestResultEntity testResultEntity;

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
        new GerminatorTrayCreateDto(activityTypeCdG10, new BigDecimal("881191"), null),
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
        if (arg.getSystemTrayNo() != null && arg.getSystemTrayNo() == 1) {
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

    // Prepare TestResultDatesDto
    TestResultDatesDto testResultDatesDto = new TestResultDatesDto(
        LocalDate.now(),
        48,
        LocalDate.now(),
        activityTypeCdG10,
        72,
        96
    );
    when(testResultRepository.getActivityResultDates(any())).thenReturn(testResultDatesDto);

    /// No conflicts for commit (always empty)
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
    verify(testResultRepository, times(6)).getActivityResultDates(any());

    // Verify updateGerminatorTray called once
    // for the activity that had actualBeginDtTm == today (881192 -> tray1 id 101)
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

    // Activity not found
    when(activityRepository.findById(eq(riaSkey))).thenReturn(Optional.empty());

    // Act / Assert
    ResponseStatusException ex = assertThrows(ResponseStatusException.class,
        () -> testResultService.assignGerminatorTrays(requests));

    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    assertEquals("Activity not found in CNS_T_RQST_ITM_ACTVTY table", ex.getReason());

    // Verify interactions
    verify(germinatorTrayRepository).save(any());
    verify(activityRepository).findById(eq(riaSkey));
  }

  @Test
  void assignGerminatorTrays_shouldThrow_whenTestResultDatesMissing() {
    String activityTypeCd = "G20";
    BigDecimal riaSkey = new BigDecimal("881190");
    final List<GerminatorTrayCreateDto> requests = List.of(
        new GerminatorTrayCreateDto(activityTypeCd, riaSkey, null)
    );

    ActivityEntity act = new ActivityEntity();
    act.setRiaKey(riaSkey);
    act.setActivityDuration(5);
    act.setRequestSkey(new BigDecimal("221"));
    act.setItemId("B");
    act.setActivityTypeCode(activityTypeCd);

    // stub tray save (service creates a tray before looking up activity)
    GerminatorTrayEntity savedTray = new GerminatorTrayEntity();
    savedTray.setGerminatorTrayId(999);
    savedTray.setActualStartDate(LocalDate.now().atStartOfDay());
    when(germinatorTrayRepository.save(any())).thenReturn(savedTray);

    when(activityRepository.findById(eq(riaSkey))).thenReturn(Optional.of(act));
    when(testResultRepository.getActivityResultDates(any())).thenReturn(null);

    // Act / Assert
    ResponseStatusException ex = assertThrows(ResponseStatusException.class,
        () -> testResultService.assignGerminatorTrays(requests));

    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    assertEquals(String.format("No test result found for activity with RIA_SKEY %s", riaSkey),
        ex.getReason());

    // Verify interactions
    verify(germinatorTrayRepository).save(any());
    verify(activityRepository).findById(eq(riaSkey));
    verify(testResultRepository).getActivityResultDates(eq(riaSkey));
  }

  @Test
  void assignGerminatorTrays_shouldNotCommit_whenConflictsExist() {
    // Arrange for RTS type using riaSkey 881197
    String activityTypeCd = "RTS";
    BigDecimal riaSkey = new BigDecimal("881197");
    final List<GerminatorTrayCreateDto> requests = List.of(
        new GerminatorTrayCreateDto(activityTypeCd, riaSkey, null)
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

    when(activityRepository.findById(eq(riaSkey))).thenReturn(Optional.of(act));

    TestResultDatesDto testResultDatesDto = new TestResultDatesDto(
        LocalDate.now(),
        48,
        LocalDate.now(),
        activityTypeCd,
        72,
        96
    );
    when(testResultRepository.getActivityResultDates(any())).thenReturn(testResultDatesDto);

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
    // Because a conflict exists, markSignificantAndCommit should NOT be called
    verify(activityRepository, times(0)).markSignificantAndCommit(any());
  }
}
