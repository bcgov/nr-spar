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

import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayAssignGerminatorIdResponseDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayContentsDto;
import ca.bc.gov.oracleapi.entity.consep.GerminationTrayContentsEntity;
import ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity;
import ca.bc.gov.oracleapi.repository.consep.GerminationTrayContentsRepository;
import ca.bc.gov.oracleapi.repository.consep.GerminatorTrayRepository;
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
}
