package ca.bc.gov.oracleapi.service.consep;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayAssignGerminatorIdResponseDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.repository.consep.ActivityRepository;
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
  private TestResultRepository testResultRepository;

  @Mock
  private ActivityRepository activityRepository;

  @InjectMocks
  private GerminatorTrayService germinatorTrayService;

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
    GerminatorTrayAssignGerminatorIdResponseDto response =
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
  void assignGerminatorIdToTray_shouldThrow_whenGerminatorIdAlreadyAssigned() {
    // Arrange
    Integer germinatorTrayId = 101;
    String newGerminatorId = "7";

    GerminatorTrayEntity tray = new GerminatorTrayEntity();
    tray.setGerminatorTrayId(germinatorTrayId);
    tray.setGerminatorId("2"); // already assigned

    when(germinatorTrayRepository.findById(germinatorTrayId))
        .thenReturn(Optional.of(tray));

    // Act / Assert
    ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
        germinatorTrayService.assignGerminatorIdToTray(germinatorTrayId, newGerminatorId));

    assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    assertTrue(ex.getReason().contains("Germinator ID already assigned"));

    verify(germinatorTrayRepository).findById(germinatorTrayId);
    verify(germinatorTrayRepository, never()).save(any());
  }

  /*---------------------- Delete test from tray ---------------------------------*/
  @Test
  void deleteTestFromTray_success_doesNotDeleteTrayWhenOthersRemain() {
    Integer germinatorTrayId = 101;
    BigDecimal riaSkey = new BigDecimal("881191");
    LocalDateTime activityUpdateTimestamp = LocalDateTime.of(2025, 3, 10, 12, 0, 0);

    TestResultEntity testResult = new TestResultEntity();
    testResult.setRiaKey(riaSkey);
    testResult.setGerminatorTrayId(germinatorTrayId);

    when(testResultRepository.findById(riaSkey)).thenReturn(Optional.of(testResult));
    when(testResultRepository.detachTestFromTray(riaSkey)).thenReturn(1);
    when(activityRepository.updateTimestampWhereMatch(riaSkey, activityUpdateTimestamp))
        .thenReturn(1);
    when(testResultRepository.countByGerminatorTrayId(germinatorTrayId)).thenReturn(2);

    germinatorTrayService.deleteTestFromTray(
        germinatorTrayId, riaSkey, activityUpdateTimestamp);

    verify(testResultRepository).detachTestFromTray(riaSkey);
    verify(activityRepository).updateTimestampWhereMatch(riaSkey, activityUpdateTimestamp);
    verify(testResultRepository).countByGerminatorTrayId(germinatorTrayId);
    verify(germinatorTrayRepository, never()).deleteByGerminatorTrayId(any());
  }

  @Test
  void deleteTestFromTray_success_deletesTrayWhenNoTestsRemain() {
    Integer germinatorTrayId = 101;
    BigDecimal riaSkey = new BigDecimal("881191");
    LocalDateTime activityUpdateTimestamp = LocalDateTime.of(2025, 3, 10, 12, 0, 0);

    TestResultEntity testResult = new TestResultEntity();
    testResult.setRiaKey(riaSkey);
    testResult.setGerminatorTrayId(germinatorTrayId);

    when(testResultRepository.findById(riaSkey)).thenReturn(Optional.of(testResult));
    when(testResultRepository.detachTestFromTray(riaSkey)).thenReturn(1);
    when(activityRepository.updateTimestampWhereMatch(riaSkey, activityUpdateTimestamp))
        .thenReturn(1);
    when(testResultRepository.countByGerminatorTrayId(germinatorTrayId)).thenReturn(0);
    when(germinatorTrayRepository.deleteByGerminatorTrayId(germinatorTrayId)).thenReturn(1);

    germinatorTrayService.deleteTestFromTray(
        germinatorTrayId, riaSkey, activityUpdateTimestamp);

    verify(germinatorTrayRepository).deleteByGerminatorTrayId(germinatorTrayId);
  }

  @Test
  void deleteTestFromTray_throwsConflict_whenDetachAffectsZeroRows() {
    Integer germinatorTrayId = 101;
    BigDecimal riaSkey = new BigDecimal("881191");
    LocalDateTime activityUpdateTimestamp = LocalDateTime.of(2025, 3, 10, 12, 0, 0);

    TestResultEntity testResult = new TestResultEntity();
    testResult.setRiaKey(riaSkey);
    testResult.setGerminatorTrayId(germinatorTrayId);

    when(testResultRepository.findById(riaSkey)).thenReturn(Optional.of(testResult));
    when(testResultRepository.detachTestFromTray(riaSkey)).thenReturn(0);

    ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
        germinatorTrayService.deleteTestFromTray(
            germinatorTrayId, riaSkey, activityUpdateTimestamp));

    assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    assertEquals(GerminatorTrayService.RESELECT_MESSAGE, ex.getReason());
    verify(activityRepository, never()).updateTimestampWhereMatch(any(), any());
  }

  @Test
  void deleteTestFromTray_throwsBadRequest_whenTestNotOnTray() {
    Integer germinatorTrayId = 101;
    BigDecimal riaSkey = new BigDecimal("881191");
    LocalDateTime activityUpdateTimestamp = LocalDateTime.of(2025, 3, 10, 12, 0, 0);

    TestResultEntity testResult = new TestResultEntity();
    testResult.setRiaKey(riaSkey);
    testResult.setGerminatorTrayId(999); // different tray

    when(testResultRepository.findById(riaSkey)).thenReturn(Optional.of(testResult));

    ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
        germinatorTrayService.deleteTestFromTray(
            germinatorTrayId, riaSkey, activityUpdateTimestamp));

    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertTrue(ex.getReason().contains("not on the specified tray"));
    verify(testResultRepository, never()).detachTestFromTray(any());
  }

  /*---------------------- Delete tray ---------------------------------*/
  @Test
  void deleteTray_success() {
    Integer germinatorTrayId = 101;
    BigDecimal riaSkey = new BigDecimal("881191");
    LocalDateTime updateTimestamp = LocalDateTime.of(2025, 3, 10, 12, 0, 0);

    ActivityEntity activity = new ActivityEntity();
    activity.setRiaKey(riaSkey);
    activity.setUpdateTimestamp(updateTimestamp);

    when(germinatorTrayRepository.existsById(germinatorTrayId)).thenReturn(true);
    when(testResultRepository.findRiaKeysByGerminatorTrayId(germinatorTrayId))
        .thenReturn(List.of(riaSkey));
    when(testResultRepository.detachTestFromTray(riaSkey)).thenReturn(1);
    when(activityRepository.findById(riaSkey)).thenReturn(Optional.of(activity));
    when(activityRepository.updateTimestampWhereMatch(eq(riaSkey), eq(updateTimestamp)))
        .thenReturn(1);
    when(germinatorTrayRepository.deleteByGerminatorTrayId(germinatorTrayId)).thenReturn(1);

    germinatorTrayService.deleteTray(germinatorTrayId);

    verify(testResultRepository).detachTestFromTray(riaSkey);
    verify(activityRepository).updateTimestampWhereMatch(riaSkey, updateTimestamp);
    verify(germinatorTrayRepository).deleteByGerminatorTrayId(germinatorTrayId);
  }

  @Test
  void deleteTray_throwsNotFound_whenTrayDoesNotExist() {
    Integer germinatorTrayId = 999;
    when(germinatorTrayRepository.existsById(germinatorTrayId)).thenReturn(false);

    ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
        germinatorTrayService.deleteTray(germinatorTrayId));

    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    assertEquals("Germinator tray not found with ID: " + germinatorTrayId, ex.getReason());
    verify(testResultRepository, never()).findRiaKeysByGerminatorTrayId(any());
  }

  @Test
  void deleteTray_throwsConflict_whenParentUpdateAffectsZeroRows() {
    Integer germinatorTrayId = 101;
    BigDecimal riaSkey = new BigDecimal("881191");
    LocalDateTime updateTimestamp = LocalDateTime.of(2025, 3, 10, 12, 0, 0);

    ActivityEntity activity = new ActivityEntity();
    activity.setRiaKey(riaSkey);
    activity.setUpdateTimestamp(updateTimestamp);

    when(germinatorTrayRepository.existsById(germinatorTrayId)).thenReturn(true);
    when(testResultRepository.findRiaKeysByGerminatorTrayId(germinatorTrayId))
        .thenReturn(List.of(riaSkey));
    when(testResultRepository.detachTestFromTray(riaSkey)).thenReturn(1);
    when(activityRepository.findById(riaSkey)).thenReturn(Optional.of(activity));
    when(activityRepository.updateTimestampWhereMatch(eq(riaSkey), eq(updateTimestamp)))
        .thenReturn(0);

    ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
        germinatorTrayService.deleteTray(germinatorTrayId));

    assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    assertEquals(GerminatorTrayService.RESELECT_MESSAGE, ex.getReason());
    verify(germinatorTrayRepository, never()).deleteByGerminatorTrayId(any());
  }
}
