package ca.bc.gov.oracleapi.service.consep;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayAssignGerminatorIdResponseDto;
import ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity;
import ca.bc.gov.oracleapi.entity.consep.TestResultEntity;
import ca.bc.gov.oracleapi.repository.consep.GerminationTrayContentsRepository;
import ca.bc.gov.oracleapi.repository.consep.GerminatorTrayRepository;
import ca.bc.gov.oracleapi.repository.consep.TestResultRepository;
import java.math.BigDecimal;
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

  @InjectMocks
  private GerminatorTrayService germinatorTrayService;

  @Mock
  private GerminationTrayContentsRepository germinationTrayContentsRepository;

  @Mock
  private TestResultRepository testResultRepository;

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

  @Test
  void removeTestFromTray_shouldThrow400_whenRiaKeyNull() {
    ResponseStatusException ex = assertThrows(
        ResponseStatusException.class,
        () -> germinatorTrayService.removeTestFromTray(null)
    );

    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    verify(testResultRepository, never()).findById(any());
  }

  @Test
  void removeTestFromTray_shouldThrow404_whenTestResultNotFound() {
    BigDecimal riaKey = new BigDecimal("881191");
    when(testResultRepository.findById(riaKey)).thenReturn(Optional.empty());

    ResponseStatusException ex = assertThrows(
        ResponseStatusException.class,
        () -> germinatorTrayService.removeTestFromTray(riaKey)
    );

    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    verify(testResultRepository).findById(riaKey);
    verify(germinatorTrayRepository, never()).findById(any());
  }

  @Test
  void removeTestFromTray_shouldThrow400_whenTestNotAssignedToTray() {
    BigDecimal riaKey = new BigDecimal("881191");
    TestResultEntity test = new TestResultEntity();
    test.setRiaKey(riaKey);
    test.setGerminatorTrayId(null);

    when(testResultRepository.findById(riaKey)).thenReturn(Optional.of(test));

    ResponseStatusException ex = assertThrows(
        ResponseStatusException.class,
        () -> germinatorTrayService.removeTestFromTray(riaKey)
    );

    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    verify(testResultRepository).findById(riaKey);
    verify(germinatorTrayRepository, never()).findById(any());
  }

  @Test
  void removeTestFromTray_shouldDeleteTray_whenLastTestOnTray() {
    BigDecimal riaKey = new BigDecimal("881191");
    Integer trayId = 101;
    Long revision = 3L;

    TestResultEntity test = new TestResultEntity();
    test.setRiaKey(riaKey);
    test.setGerminatorTrayId(trayId);

    GerminatorTrayEntity tray = new GerminatorTrayEntity();
    tray.setGerminatorTrayId(trayId);
    tray.setRevisionCount(revision);

    when(testResultRepository.findById(riaKey)).thenReturn(Optional.of(test));
    when(germinatorTrayRepository.findById(trayId)).thenReturn(Optional.of(tray));
    when(testResultRepository.countByGerminatorTrayId(trayId)).thenReturn(1L);
    when(testResultRepository.clearGerminatorTrayAssignment(riaKey, trayId)).thenReturn(1);
    when(germinatorTrayRepository.deleteByIdAndRevisionCount(trayId, revision)).thenReturn(1);

    germinatorTrayService.removeTestFromTray(riaKey);

    verify(testResultRepository).clearGerminatorTrayAssignment(riaKey, trayId);
    verify(germinatorTrayRepository).deleteByIdAndRevisionCount(trayId, revision);
    verify(germinatorTrayRepository, never())
      .incrementRevisionCountWithVersionCheck(any(), any());
  }

  @Test
  void removeTestFromTray_shouldIncrementRevision_whenTrayHasMultipleTests() {
    BigDecimal riaKey = new BigDecimal("881191");
    Integer trayId = 101;
    Long revision = 5L;

    TestResultEntity test = new TestResultEntity();
    test.setRiaKey(riaKey);
    test.setGerminatorTrayId(trayId);

    GerminatorTrayEntity tray = new GerminatorTrayEntity();
    tray.setGerminatorTrayId(trayId);
    tray.setRevisionCount(revision);

    when(testResultRepository.findById(riaKey)).thenReturn(Optional.of(test));
    when(germinatorTrayRepository.findById(trayId)).thenReturn(Optional.of(tray));
    when(testResultRepository.countByGerminatorTrayId(trayId)).thenReturn(3L);
    when(testResultRepository.clearGerminatorTrayAssignment(riaKey, trayId)).thenReturn(1);
    when(germinatorTrayRepository.incrementRevisionCountWithVersionCheck(trayId, revision))
        .thenReturn(1);

    germinatorTrayService.removeTestFromTray(riaKey);

    verify(testResultRepository).clearGerminatorTrayAssignment(riaKey, trayId);
    verify(germinatorTrayRepository).incrementRevisionCountWithVersionCheck(trayId, revision);
    verify(germinatorTrayRepository, never())
      .deleteByIdAndRevisionCount(any(), any());
  }

  @Test
  void removeTestFromTray_shouldThrow409_whenClearAssignmentAffectsZeroRows_andTestStillExists() {
    BigDecimal riaKey = new BigDecimal("881191");
    Integer trayId = 101;
    Long revision = 2L;

    TestResultEntity test = new TestResultEntity();
    test.setRiaKey(riaKey);
    test.setGerminatorTrayId(trayId);

    GerminatorTrayEntity tray = new GerminatorTrayEntity();
    tray.setGerminatorTrayId(trayId);
    tray.setRevisionCount(revision);

    when(testResultRepository.findById(riaKey)).thenReturn(Optional.of(test));
    when(germinatorTrayRepository.findById(trayId)).thenReturn(Optional.of(tray));
    when(testResultRepository.countByGerminatorTrayId(trayId)).thenReturn(2L);
    when(testResultRepository.clearGerminatorTrayAssignment(riaKey, trayId)).thenReturn(0);
    when(testResultRepository.existsById(riaKey)).thenReturn(true);

    ResponseStatusException ex = assertThrows(
        ResponseStatusException.class,
        () -> germinatorTrayService.removeTestFromTray(riaKey)
    );

    assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    verify(testResultRepository).existsById(riaKey);
  }

  @Test
  void removeTestFromTray_shouldThrow404_whenClearAssignmentAffectsZeroRows_andTestMissing() {
    BigDecimal riaKey = new BigDecimal("881191");
    Integer trayId = 101;
    Long revision = 2L;

    TestResultEntity test = new TestResultEntity();
    test.setRiaKey(riaKey);
    test.setGerminatorTrayId(trayId);

    GerminatorTrayEntity tray = new GerminatorTrayEntity();
    tray.setGerminatorTrayId(trayId);
    tray.setRevisionCount(revision);

    when(testResultRepository.findById(riaKey)).thenReturn(Optional.of(test));
    when(germinatorTrayRepository.findById(trayId)).thenReturn(Optional.of(tray));
    when(testResultRepository.countByGerminatorTrayId(trayId)).thenReturn(2L);
    when(testResultRepository.clearGerminatorTrayAssignment(riaKey, trayId)).thenReturn(0);
    when(testResultRepository.existsById(riaKey)).thenReturn(false);

    ResponseStatusException ex = assertThrows(
        ResponseStatusException.class,
        () -> germinatorTrayService.removeTestFromTray(riaKey)
    );

    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    verify(testResultRepository).existsById(riaKey);
  }

  @Test
  void removeTestFromTray_shouldThrow409_whenDeleteVersionCheckFails() {
    BigDecimal riaKey = new BigDecimal("881191");
    Integer trayId = 101;
    Long revision = 9L;

    TestResultEntity test = new TestResultEntity();
    test.setRiaKey(riaKey);
    test.setGerminatorTrayId(trayId);

    GerminatorTrayEntity tray = new GerminatorTrayEntity();
    tray.setGerminatorTrayId(trayId);
    tray.setRevisionCount(revision);

    when(testResultRepository.findById(riaKey)).thenReturn(Optional.of(test));
    when(germinatorTrayRepository.findById(trayId)).thenReturn(Optional.of(tray));
    when(testResultRepository.countByGerminatorTrayId(trayId)).thenReturn(1L);
    when(testResultRepository.clearGerminatorTrayAssignment(riaKey, trayId)).thenReturn(1);
    when(germinatorTrayRepository.deleteByIdAndRevisionCount(trayId, revision)).thenReturn(0);

    ResponseStatusException ex = assertThrows(
        ResponseStatusException.class,
        () -> germinatorTrayService.removeTestFromTray(riaKey)
    );

    assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
  }

  @Test
  void removeTestFromTray_shouldThrow409_whenIncrementVersionCheckFails() {
    BigDecimal riaKey = new BigDecimal("881191");
    Integer trayId = 101;
    Long revision = 9L;

    TestResultEntity test = new TestResultEntity();
    test.setRiaKey(riaKey);
    test.setGerminatorTrayId(trayId);

    GerminatorTrayEntity tray = new GerminatorTrayEntity();
    tray.setGerminatorTrayId(trayId);
    tray.setRevisionCount(revision);

    when(testResultRepository.findById(riaKey)).thenReturn(Optional.of(test));
    when(germinatorTrayRepository.findById(trayId)).thenReturn(Optional.of(tray));
    when(testResultRepository.countByGerminatorTrayId(trayId)).thenReturn(4L);
    when(testResultRepository.clearGerminatorTrayAssignment(riaKey, trayId)).thenReturn(1);
    when(germinatorTrayRepository.incrementRevisionCountWithVersionCheck(trayId, revision))
        .thenReturn(0);

    ResponseStatusException ex = assertThrows(
        ResponseStatusException.class,
        () -> germinatorTrayService.removeTestFromTray(riaKey)
    );

    assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
  }

  @Test
  void removeTestFromTray_shouldThrow404_whenTrayNotFound() {
    BigDecimal riaKey = new BigDecimal("881191");
    Integer trayId = 101;

    TestResultEntity test = new TestResultEntity();
    test.setRiaKey(riaKey);
    test.setGerminatorTrayId(trayId);

    when(testResultRepository.findById(riaKey)).thenReturn(Optional.of(test));
    when(germinatorTrayRepository.findById(trayId)).thenReturn(Optional.empty());

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class, () -> germinatorTrayService.removeTestFromTray(riaKey));

    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    assertEquals("Germinator tray not found with ID: " + trayId, ex.getReason());

    verify(testResultRepository).findById(riaKey);
    verify(germinatorTrayRepository).findById(trayId);
    verify(testResultRepository, never()).countByGerminatorTrayId(any());
    verify(testResultRepository, never()).clearGerminatorTrayAssignment(any(), any());
    verify(testResultRepository, never()).existsById(any());
    verify(germinatorTrayRepository, never()).deleteByIdAndRevisionCount(any(), any());
    verify(germinatorTrayRepository, never()).incrementRevisionCountWithVersionCheck(any(), any());
  }
}
