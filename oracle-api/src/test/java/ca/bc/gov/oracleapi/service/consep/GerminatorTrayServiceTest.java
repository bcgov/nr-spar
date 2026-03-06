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
import ca.bc.gov.oracleapi.repository.consep.GerminatorTrayRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
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
}
