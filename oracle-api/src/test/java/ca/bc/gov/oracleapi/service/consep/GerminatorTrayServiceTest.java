package ca.bc.gov.oracleapi.service.consep;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.oracleapi.dto.consep.GerminatorIdAssignResponseDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayContentsDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTraySearchRequestDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTraySearchResponseDto;
import ca.bc.gov.oracleapi.entity.consep.GerminationTrayContentsEntity;
import ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.repository.consep.ActivityRepository;
import ca.bc.gov.oracleapi.repository.consep.GerminationTrayContentsRepository;
import ca.bc.gov.oracleapi.repository.consep.GerminatorTrayRepository;
import ca.bc.gov.oracleapi.repository.consep.TestResultRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * The test class for Germinator Tray Service.
 */
@ExtendWith(MockitoExtension.class)
class GerminatorTrayServiceTest {

  @Mock
  private GerminatorTrayRepository germinatorTrayRepository;

  @Mock
  private GerminationTrayContentsRepository germinationTrayContentsRepository;

  @InjectMocks
  private GerminatorTrayService germinatorTrayService;

  @Mock
  private TestResultRepository testResultRepository;

  @Mock
  private ActivityRepository activityRepository;

  /*---------------------- Assign Germinator ID to Tray ---------------------------------*/
  @Test
  void assignGerminatorIdToTray_success() {
    // Arrange
    Integer germinatorTrayId = 101;
    String germinatorId = "5";

    GerminatorTrayEntity tray = new GerminatorTrayEntity();
    tray.setGerminatorTrayId(germinatorTrayId);
    tray.setGerminatorId(null);

    when(germinatorTrayRepository.findById(germinatorTrayId))
        .thenReturn(Optional.of(tray));

    when(germinatorTrayRepository.save(tray)).thenReturn(tray);

    // Act
    GerminatorIdAssignResponseDto response =
        germinatorTrayService.assignGerminatorIdToTray(germinatorTrayId, germinatorId);

    // Assert
    assertNotNull(response);
    assertEquals(germinatorTrayId, response.germinatorTrayId());
    assertEquals(germinatorId, response.germinatorId());
    assertEquals(germinatorId, tray.getGerminatorId());

    verify(germinatorTrayRepository).findById(germinatorTrayId);
    verify(germinatorTrayRepository).save(tray);
  }

  @Test
  void assignGerminatorIdToTray_shouldThrow_whenTrayNotFound() {
    // Arrange
    Integer germinatorTrayId = 999;
    String germinatorId = "3";

    when(germinatorTrayRepository.findById(germinatorTrayId))
        .thenReturn(Optional.empty());

    // Act / Assert
    ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
        germinatorTrayService.assignGerminatorIdToTray(germinatorTrayId, germinatorId));

    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    assertEquals("Germinator tray not found with ID: " + germinatorTrayId, ex.getReason());

    verify(germinatorTrayRepository).findById(germinatorTrayId);
    verify(germinatorTrayRepository, never()).save(any());
  }

  @Test
  void assignGerminatorIdToTray_shouldUpdate_whenGerminatorIdAlreadyAssigned() {
    // Arrange
    Integer germinatorTrayId = 101;
    String newGerminatorId = "7";

    GerminatorTrayEntity tray = new GerminatorTrayEntity();
    tray.setGerminatorTrayId(germinatorTrayId);
    tray.setGerminatorId("2"); // existing value

    when(germinatorTrayRepository.findById(germinatorTrayId))
        .thenReturn(Optional.of(tray));

    when(germinatorTrayRepository.save(any(GerminatorTrayEntity.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    GerminatorIdAssignResponseDto result =
        germinatorTrayService.assignGerminatorIdToTray(
            germinatorTrayId,
            newGerminatorId
        );

    // Assert
    assertEquals(germinatorTrayId, result.germinatorTrayId());
    assertEquals(newGerminatorId, result.germinatorId());

    assertEquals(newGerminatorId, tray.getGerminatorId());

    verify(germinatorTrayRepository).findById(germinatorTrayId);
    verify(germinatorTrayRepository).save(tray);
  }

  @Test
  void assignGerminatorIdToTray_shouldThrow_whenGerminatorIdIsNull() {
    // Arrange
    Integer germinatorTrayId = 100;
    String germinatorId = null;

    // Act & Assert
    ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
        germinatorTrayService.assignGerminatorIdToTray(germinatorTrayId, germinatorId));

    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals("Germinator tray ID and germinator ID cannot be null or blank", ex.getReason());

    verify(germinatorTrayRepository, never()).findById(any());
    verify(germinatorTrayRepository, never()).save(any());
  }

  /*--------------------- Delete test from tray ---------------------------------*/
  @Test
  void deleteTestFromTray_shouldDetachAndKeepTray_whenOtherTestsRemain() {
    Integer trayId = 101;
    BigDecimal riaSkey = BigDecimal.valueOf(123);
    LocalDateTime updateTimestamp = LocalDateTime.of(2026, 4, 1, 10, 0);

    TestResultEntity testResult = new TestResultEntity();
    testResult.setRiaKey(riaSkey);
    testResult.setGerminatorTrayId(trayId);

    when(testResultRepository.findById(riaSkey)).thenReturn(Optional.of(testResult));
    when(testResultRepository.detachTestFromTray(riaSkey)).thenReturn(1);
    when(activityRepository.updateTimestampWhereMatch(riaSkey, updateTimestamp)).thenReturn(1);
    when(testResultRepository.countByGerminatorTrayId(trayId)).thenReturn(2);

    germinatorTrayService.deleteTestFromTray(trayId, riaSkey, updateTimestamp);

    verify(testResultRepository).findById(riaSkey);
    verify(testResultRepository).detachTestFromTray(riaSkey);
    verify(activityRepository).updateTimestampWhereMatch(riaSkey, updateTimestamp);
    verify(testResultRepository).countByGerminatorTrayId(trayId);
    verify(germinatorTrayRepository, never()).deleteByGerminatorTrayId(any());
  }

  @Test
  void deleteTestFromTray_shouldDeleteTray_whenNoTestsRemain() {
    Integer trayId = 101;
    BigDecimal riaSkey = BigDecimal.valueOf(123);
    LocalDateTime updateTimestamp = LocalDateTime.of(2026, 4, 1, 10, 0);

    TestResultEntity testResult = new TestResultEntity();
    testResult.setRiaKey(riaSkey);
    testResult.setGerminatorTrayId(trayId);

    when(testResultRepository.findById(riaSkey)).thenReturn(Optional.of(testResult));
    when(testResultRepository.detachTestFromTray(riaSkey)).thenReturn(1);
    when(activityRepository.updateTimestampWhereMatch(riaSkey, updateTimestamp)).thenReturn(1);
    when(testResultRepository.countByGerminatorTrayId(trayId)).thenReturn(0);
    when(germinatorTrayRepository.deleteByGerminatorTrayId(trayId)).thenReturn(1);

    germinatorTrayService.deleteTestFromTray(trayId, riaSkey, updateTimestamp);

    verify(germinatorTrayRepository).deleteByGerminatorTrayId(trayId);
  }

  @Test
  void deleteTestFromTray_shouldThrowConflict_whenDetachAffectsZeroRows() {
    Integer trayId = 101;
    BigDecimal riaSkey = BigDecimal.valueOf(123);
    LocalDateTime updateTimestamp = LocalDateTime.of(2026, 4, 1, 10, 0);

    TestResultEntity testResult = new TestResultEntity();
    testResult.setRiaKey(riaSkey);
    testResult.setGerminatorTrayId(trayId);

    when(testResultRepository.findById(riaSkey)).thenReturn(Optional.of(testResult));
    when(testResultRepository.detachTestFromTray(riaSkey)).thenReturn(0);

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> germinatorTrayService.deleteTestFromTray(trayId, riaSkey, updateTimestamp));

    assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    assertEquals(GerminatorTrayService.RESELECT_MESSAGE, ex.getReason());

    verify(activityRepository, never()).updateTimestampWhereMatch(any(), any());
  }

  @Test
  void deleteTestFromTray_shouldThrowNotFound_whenRiaKeyDoesNotExist() {
    Integer trayId = 101;
    BigDecimal riaSkey = BigDecimal.valueOf(999);
    LocalDateTime updateTimestamp = LocalDateTime.of(2026, 4, 1, 10, 0);

    when(testResultRepository.findById(riaSkey)).thenReturn(Optional.empty());

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> germinatorTrayService.deleteTestFromTray(trayId, riaSkey, updateTimestamp));

    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    assertEquals("Test not found for RIA_SKEY: " + riaSkey, ex.getReason());

    verify(testResultRepository).findById(riaSkey);
    verify(testResultRepository, never()).detachTestFromTray(any());
    verify(activityRepository, never()).updateTimestampWhereMatch(any(), any());
  }

  @Test
  void deleteTestFromTray_shouldThrowBadRequest_whenTestNotOnSpecifiedTray() {
    Integer trayId = 101;
    BigDecimal riaSkey = BigDecimal.valueOf(123);
    LocalDateTime updateTimestamp = LocalDateTime.of(2026, 4, 1, 10, 0);

    TestResultEntity testResult = new TestResultEntity();
    testResult.setRiaKey(riaSkey);
    testResult.setGerminatorTrayId(999); // different tray ID

    when(testResultRepository.findById(riaSkey)).thenReturn(Optional.of(testResult));

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> germinatorTrayService.deleteTestFromTray(trayId, riaSkey, updateTimestamp));

    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals("Test is not on the specified tray", ex.getReason());

    verify(testResultRepository).findById(riaSkey);
    verify(testResultRepository, never()).detachTestFromTray(any());
    verify(activityRepository, never()).updateTimestampWhereMatch(any(), any());
  }

  /*--------------------- Delete tray ---------------------------------*/
  @Test
  void deleteTray_shouldDetachAllTestsAndDeleteTray() {
    Integer trayId = 101;
    LocalDateTime updateTimestamp = LocalDateTime.of(2026, 4, 1, 10, 0);
    List<BigDecimal> riaKeys = List.of(BigDecimal.valueOf(1), BigDecimal.valueOf(2));

    when(germinatorTrayRepository.existsById(trayId)).thenReturn(true);
    when(testResultRepository.findRiaKeysByGerminatorTrayId(trayId)).thenReturn(riaKeys);
    when(testResultRepository.detachTestFromTray(BigDecimal.valueOf(1))).thenReturn(1);
    when(testResultRepository.detachTestFromTray(BigDecimal.valueOf(2))).thenReturn(1);
    when(activityRepository.updateTimestampWhereMatch(BigDecimal.valueOf(1), updateTimestamp))
        .thenReturn(1);
    when(activityRepository.updateTimestampWhereMatch(BigDecimal.valueOf(2), updateTimestamp))
        .thenReturn(1);
    when(germinatorTrayRepository.deleteByGerminatorTrayId(trayId)).thenReturn(1);

    germinatorTrayService.deleteTray(trayId, updateTimestamp);

    verify(testResultRepository).findRiaKeysByGerminatorTrayId(trayId);
    verify(testResultRepository).detachTestFromTray(BigDecimal.valueOf(1));
    verify(testResultRepository).detachTestFromTray(BigDecimal.valueOf(2));
    verify(activityRepository).updateTimestampWhereMatch(BigDecimal.valueOf(1), updateTimestamp);
    verify(activityRepository).updateTimestampWhereMatch(BigDecimal.valueOf(2), updateTimestamp);
    verify(germinatorTrayRepository).deleteByGerminatorTrayId(trayId);
  }

  @Test
  void deleteTray_shouldThrowNotFound_whenTrayDoesNotExist() {
    Integer trayId = 999;
    LocalDateTime updateTimestamp = LocalDateTime.of(2026, 4, 1, 10, 0);

    when(germinatorTrayRepository.existsById(trayId)).thenReturn(false);

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> germinatorTrayService.deleteTray(trayId, updateTimestamp));

    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    assertEquals("Germinator tray not found with ID: " + trayId, ex.getReason());

    verify(germinatorTrayRepository).existsById(trayId);
    verify(testResultRepository, never()).findRiaKeysByGerminatorTrayId(any());
  }

  @Test
  void deleteTray_shouldThrowConflict_whenDetachAffectsZeroRows() {
    Integer trayId = 101;
    LocalDateTime updateTimestamp = LocalDateTime.of(2026, 4, 1, 10, 0);
    List<BigDecimal> riaKeys = List.of(BigDecimal.valueOf(1));

    when(germinatorTrayRepository.existsById(trayId)).thenReturn(true);
    when(testResultRepository.findRiaKeysByGerminatorTrayId(trayId)).thenReturn(riaKeys);
    when(testResultRepository.detachTestFromTray(BigDecimal.valueOf(1))).thenReturn(0);

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> germinatorTrayService.deleteTray(trayId, updateTimestamp));

    assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    assertEquals(GerminatorTrayService.RESELECT_MESSAGE, ex.getReason());

    verify(testResultRepository).detachTestFromTray(BigDecimal.valueOf(1));
    verify(activityRepository, never()).updateTimestampWhereMatch(any(), any());
  }

  @Test
  void deleteTray_shouldThrowConflict_whenUpdateTimestampAffectsZeroRows() {
    Integer trayId = 101;
    LocalDateTime updateTimestamp = LocalDateTime.of(2026, 4, 1, 10, 0);
    List<BigDecimal> riaKeys = List.of(BigDecimal.valueOf(1));

    when(germinatorTrayRepository.existsById(trayId)).thenReturn(true);
    when(testResultRepository.findRiaKeysByGerminatorTrayId(trayId)).thenReturn(riaKeys);
    when(testResultRepository.detachTestFromTray(BigDecimal.valueOf(1))).thenReturn(1);
    when(activityRepository.updateTimestampWhereMatch(BigDecimal.valueOf(1), updateTimestamp))
        .thenReturn(0);

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> germinatorTrayService.deleteTray(trayId, updateTimestamp));

    assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    assertEquals(GerminatorTrayService.RESELECT_MESSAGE, ex.getReason());

    verify(germinatorTrayRepository, never()).deleteByGerminatorTrayId(any());
  }

  @Test
  void deleteTray_shouldThrowConflict_whenDeleteAffectsZeroRows() {
    Integer trayId = 101;
    LocalDateTime updateTimestamp = LocalDateTime.of(2026, 4, 1, 10, 0);
    List<BigDecimal> riaKeys = List.of(BigDecimal.valueOf(1));

    when(germinatorTrayRepository.existsById(trayId)).thenReturn(true);
    when(testResultRepository.findRiaKeysByGerminatorTrayId(trayId)).thenReturn(riaKeys);
    when(testResultRepository.detachTestFromTray(BigDecimal.valueOf(1))).thenReturn(1);
    when(activityRepository.updateTimestampWhereMatch(BigDecimal.valueOf(1), updateTimestamp))
        .thenReturn(1);
    when(germinatorTrayRepository.deleteByGerminatorTrayId(trayId)).thenReturn(0);

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> germinatorTrayService.deleteTray(trayId, updateTimestamp));

    assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    assertEquals(GerminatorTrayService.RESELECT_MESSAGE, ex.getReason());

    verify(germinatorTrayRepository).deleteByGerminatorTrayId(trayId);
  }

  @Test
  void getTrayContents_shouldThrowBadRequest_whenTrayIdIsNull() {
    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class, () -> germinatorTrayService.getTrayContents(null));

    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals("Germinator tray ID cannot be null", ex.getReason());

    verify(germinatorTrayRepository, never()).existsById(any());
    verify(germinationTrayContentsRepository, never()).findByGerminatorTrayId(any());
  }

  @Test
  void getTrayContents_shouldThrowNotFound_whenTrayDoesNotExist() {
    Integer trayId = 999;

    when(germinatorTrayRepository.existsById(trayId)).thenReturn(false);

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class, () -> germinatorTrayService.getTrayContents(trayId));

    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    assertEquals("Germinator tray not found with ID: " + trayId, ex.getReason());

    verify(germinatorTrayRepository).existsById(trayId);
    verify(germinationTrayContentsRepository, never()).findByGerminatorTrayId(any());
  }

  @Test
  void getTrayContents_shouldReturnMappedDtos_whenTrayExistsAndHasContents() {
    Integer trayId = 101;

    GerminationTrayContentsEntity e1 = new GerminationTrayContentsEntity();
    e1.setGerminatorTrayId(trayId);
    e1.setRequestId("RTS10000001");
    e1.setSeedlotNumber("30350");
    e1.setWarmStratStartDate(LocalDateTime.of(2026, 3, 1, 10, 0));
    e1.setDrybackStartDate(LocalDateTime.of(2026, 3, 2, 10, 0));
    e1.setGerminatorEntry(LocalDateTime.of(2026, 3, 3, 10, 0));
    e1.setStratStartDate(LocalDateTime.of(2026, 2, 25, 10, 0));
    e1.setTestCompleteInd(-1);
    e1.setAcceptResultInd(0);

    LocalDateTime updateTimestamp = LocalDateTime.of(2026, 3, 5, 9, 0);

    when(germinatorTrayRepository.existsById(trayId)).thenReturn(true);
    when(germinationTrayContentsRepository.findByGerminatorTrayId(trayId))
        .thenReturn(List.<Object[]>of(new Object[] {e1, updateTimestamp}));

    List<GerminatorTrayContentsDto> result = germinatorTrayService.getTrayContents(trayId);

    assertEquals(1, result.size());
    GerminatorTrayContentsDto dto = result.get(0);
    assertEquals(trayId, dto.germinatorTrayId());
    assertEquals("RTS10000001", dto.requestId());
    assertEquals("30350", dto.seedlotNumber());
    assertEquals(LocalDateTime.of(2026, 3, 1, 10, 0), dto.warmStratStartDate());
    assertEquals(LocalDateTime.of(2026, 3, 2, 10, 0), dto.drybackStartDate());
    assertEquals(LocalDateTime.of(2026, 3, 3, 10, 0), dto.germinatorEntry());
    assertEquals(LocalDateTime.of(2026, 2, 25, 10, 0), dto.stratStartDate());
    assertEquals(-1, dto.testCompleteInd());
    assertEquals(0, dto.acceptResultInd());
    assertEquals(updateTimestamp, dto.updateTimestamp());

    verify(germinatorTrayRepository).existsById(trayId);
    verify(germinationTrayContentsRepository).findByGerminatorTrayId(trayId);
  }

  @Test
  void getTrayContents_shouldReturnEmpty_whenTrayExistsAndNoContents() {
    Integer trayId = 101;

    when(germinatorTrayRepository.existsById(trayId)).thenReturn(true);
    when(germinationTrayContentsRepository.findByGerminatorTrayId(trayId)).thenReturn(List.of());

    List<GerminatorTrayContentsDto> result = germinatorTrayService.getTrayContents(trayId);

    assertTrue(result.isEmpty());
    verify(germinatorTrayRepository, times(1)).existsById(trayId);
    verify(germinationTrayContentsRepository, times(1)).findByGerminatorTrayId(trayId);
  }

  @Test
  void getTrayContents_shouldReturnNullUpdateTimestamp_whenActivityNotFound() {
    Integer trayId = 101;

    GerminationTrayContentsEntity e1 = new GerminationTrayContentsEntity();
    e1.setGerminatorTrayId(trayId);
    e1.setRequestId("RTS10000001");
    e1.setSeedlotNumber("30350");

    when(germinatorTrayRepository.existsById(trayId)).thenReturn(true);
    when(germinationTrayContentsRepository.findByGerminatorTrayId(trayId))
        .thenReturn(List.<Object[]>of(new Object[] {e1, null})); // null = no matching activity

    List<GerminatorTrayContentsDto> result = germinatorTrayService.getTrayContents(trayId);

    assertEquals(1, result.size());
    assertNull(result.get(0).updateTimestamp());
  }

  /*---------------------- Search germinator trays ---------------------------------*/
  @Test
  void searchGerminatorTrays_shouldThrowBadRequest_whenOpenSearch() {
    GerminatorTraySearchRequestDto request = new GerminatorTraySearchRequestDto("   ", "   ");

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> germinatorTrayService.searchGerminatorTrays(request));

    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals("At least one search criterion is required", ex.getReason());

    verify(germinatorTrayRepository, never()).searchGerminatorTrays(any(), any(), any());
  }

  @Test
  void searchGerminatorTrays_shouldSearchBySeedlotOnly() {
    GerminatorTraySearchRequestDto request = new GerminatorTraySearchRequestDto("30350", null);

    GerminatorTraySearchResponseDto row =
        new GerminatorTraySearchResponseDto(
            1311,
            "G10",
            LocalDateTime.of(2025, 3, 12, 0, 0),
            LocalDateTime.of(2025, 3, 11, 15, 26),
            0L,
            2,
            "4");

    when(germinatorTrayRepository.searchGerminatorTrays("30350", null, null))
        .thenReturn(List.of(row));

    List<GerminatorTraySearchResponseDto> result =
        germinatorTrayService.searchGerminatorTrays(request);

    assertEquals(1, result.size());
    assertEquals(1311, result.get(0).germinatorTrayId());
    verify(germinatorTrayRepository).searchGerminatorTrays("30350", null, null);
  }

  @Test
  void searchGerminatorTrays_shouldSplitRequestItemIntoRequestIdAndItem() {
    GerminatorTraySearchRequestDto request =
        new GerminatorTraySearchRequestDto(null, "TST20250025B");

    when(germinatorTrayRepository.searchGerminatorTrays(null, "TST20250025", "B"))
        .thenReturn(List.of());

    List<GerminatorTraySearchResponseDto> result =
        germinatorTrayService.searchGerminatorTrays(request);

    assertTrue(result.isEmpty());
    verify(germinatorTrayRepository).searchGerminatorTrays(null, "TST20250025", "B");
  }

  @Test
  void searchGerminatorTrays_shouldRejectInvalidRequestIdOrItemLength() {
    GerminatorTraySearchRequestDto request = new GerminatorTraySearchRequestDto(null, "TST2025");
    ResponseStatusException exception =
        assertThrows(
            ResponseStatusException.class,
            () -> germinatorTrayService.searchGerminatorTrays(request));
    assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    verify(germinatorTrayRepository, never()).searchGerminatorTrays(any(), any(), any());
  }

  @Test
  void searchGerminatorTrays_shouldUseBothFilters_whenBothProvided() {
    GerminatorTraySearchRequestDto request =
        new GerminatorTraySearchRequestDto("FMLY12345", "TST20250025");

    when(germinatorTrayRepository.searchGerminatorTrays("FMLY12345", "TST20250025", null))
        .thenReturn(List.of());

    germinatorTrayService.searchGerminatorTrays(request);

    verify(germinatorTrayRepository).searchGerminatorTrays("FMLY12345", "TST20250025", null);
  }
}
