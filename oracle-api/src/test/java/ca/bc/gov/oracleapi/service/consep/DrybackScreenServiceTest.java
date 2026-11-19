package ca.bc.gov.oracleapi.service.consep;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.oracleapi.dto.consep.DrybackScreenDto;
import ca.bc.gov.oracleapi.repository.consep.ActivityRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Unit tests for DrybackScreenService.
 * Tests the business logic for retrieving G64 Dryback Calculation screen data.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("DrybackScreenService Tests")
public class DrybackScreenServiceTest {

  @Mock
  private ActivityRepository activityRepository;

  @InjectMocks
  private DrybackScreenService drybackScreenService;

  /**
   * Test: Happy path - valid riaSkey returns complete dryback screen data with MC test value.
   */
  @Test
  @DisplayName("getDrybackScreenData returns DTO with all fields including storageMc")
  void getDrybackScreenData_returnsDtoWithAllFields() {
    BigDecimal riaSkey = new BigDecimal("7338");
    LocalDateTime now = LocalDateTime.now();

    DrybackScreenDto expectedDto = new DrybackScreenDto(
        riaSkey,
        "00001234",
        "1",
        "01234",
        "0123456789012",
        "G64",
        "G64",
        now,
        now.plusHours(8),
        new BigDecimal("400.123"),
        new BigDecimal("8.5"),
        new BigDecimal("450.456"),
        new BigDecimal("420.789"),
        new BigDecimal("5.2"),
        240,
        new BigDecimal("0.135"),
        new BigDecimal("0.158"),
        new BigDecimal("400.000"),
        new BigDecimal("8.5"),  // storageMc
        "Sample notes",
        now
    );

    when(activityRepository.findDrybackScreenDataByRiaSkey(riaSkey))
        .thenReturn(Optional.of(expectedDto));

    DrybackScreenDto result = drybackScreenService.getDrybackScreenData(riaSkey);

    assertNotNull(result);
    assertEquals(riaSkey, result.getRiaSkey());
    assertEquals("00001234", result.getRequestId());
    assertEquals("01234", result.getSeedlotNumber());
    assertEquals(new BigDecimal("400.123"), result.getDryWeight());
    assertEquals(new BigDecimal("8.5"), result.getStorageMc());
    assertEquals(240, result.getDrybackTime());

    verify(activityRepository).findDrybackScreenDataByRiaSkey(riaSkey);
  }

  /**
   * Test: Valid riaSkey with no accepted MC test returns dryback data with storageMc = null.
   * Verifies the API still returns 200 OK and RIA data when no accepted MC test exists.
   */
  @Test
  @DisplayName("getDrybackScreenData returns DTO with storageMc null when no accepted MC test")
  void getDrybackScreenData_returnsWithNullStorageMc_whenNoAcceptedMc() {
    BigDecimal riaSkey = new BigDecimal("7339");
    LocalDateTime now = LocalDateTime.now();

    DrybackScreenDto expectedDto = new DrybackScreenDto(
        riaSkey,
        "00001235",
        "1",
        "01235",
        "0123456789013",
        "G64",
        "G64",
        now,
        now.plusHours(8),
        new BigDecimal("400.000"),
        new BigDecimal("8.0"),
        new BigDecimal("450.000"),
        new BigDecimal("420.000"),
        new BigDecimal("5.0"),
        240,
        new BigDecimal("0.130"),
        new BigDecimal("0.150"),
        new BigDecimal("400.000"),
        null,  // storageMc is null
        "No MC test",
        now
    );

    when(activityRepository.findDrybackScreenDataByRiaSkey(riaSkey))
        .thenReturn(Optional.of(expectedDto));

    DrybackScreenDto result = drybackScreenService.getDrybackScreenData(riaSkey);

    assertNotNull(result);
    assertEquals(riaSkey, result.getRiaSkey());
    assertEquals("01235", result.getSeedlotNumber());
    assertNull(result.getStorageMc());

    verify(activityRepository).findDrybackScreenDataByRiaSkey(riaSkey);
  }

  /**
   * Test: Invalid riaSkey (not found) throws 404 Not Found exception.
   */
  @Test
  @DisplayName("getDrybackScreenData throws 404 when riaSkey not found")
  void getDrybackScreenData_throws404_whenRiaskeyNotFound() {
    BigDecimal invalidRiaSkey = new BigDecimal("99999");

    when(activityRepository.findDrybackScreenDataByRiaSkey(invalidRiaSkey))
        .thenReturn(Optional.empty());

    ResponseStatusException exception = assertThrows(
        ResponseStatusException.class,
        () -> drybackScreenService.getDrybackScreenData(invalidRiaSkey)
    );

    assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    assertEquals("Activity not found", exception.getReason());

    verify(activityRepository).findDrybackScreenDataByRiaSkey(invalidRiaSkey);
  }

  /**
   * Test: Null riaSkey throws 400 Bad Request exception.
   */
  @Test
  @DisplayName("getDrybackScreenData throws 400 when riaSkey is null")
  void getDrybackScreenData_throws400_whenRiaskeyIsNull() {
    ResponseStatusException exception = assertThrows(
        ResponseStatusException.class,
        () -> drybackScreenService.getDrybackScreenData(null)
    );

    assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    assertEquals("riaSkey is required", exception.getReason());
  }

  /**
   * Test: Returned values are not recalculated - stored values are returned as-is.
   * Verifies the acceptance criterion that previously saved values are returned without recalculation.
   */
  @Test
  @DisplayName("getDrybackScreenData returns stored values without recalculation")
  void getDrybackScreenData_returnsSavedValues_withoutRecalculation() {
    BigDecimal riaSkey = new BigDecimal("7340");
    LocalDateTime now = LocalDateTime.now();

    // Test with specific stored dryback values
    DrybackScreenDto expectedDto = new DrybackScreenDto(
        riaSkey,
        "00001236",
        "1",
        "01236",
        "0123456789014",
        "G64",
        "G64",
        now,
        now.plusHours(8),
        new BigDecimal("399.999"),  // Stored dry weight
        new BigDecimal("8.3"),      // Stored prior moisture
        new BigDecimal("449.999"),  // Stored imbibed weight
        new BigDecimal("419.999"),  // Stored dryback weight
        new BigDecimal("5.1"),      // Stored dryback moisture content
        235,                        // Stored dryback time
        new BigDecimal("0.134"),    // Stored target 30% moisture
        new BigDecimal("0.157"),    // Stored target 35% moisture
        new BigDecimal("399.999"),  // Stored strat end weight
        new BigDecimal("8.4"),      // Stored MC from test result
        "Previous test run",
        now
    );

    when(activityRepository.findDrybackScreenDataByRiaSkey(riaSkey))
        .thenReturn(Optional.of(expectedDto));

    DrybackScreenDto result = drybackScreenService.getDrybackScreenData(riaSkey);

    // Verify all stored values are returned exactly as stored
    assertEquals(new BigDecimal("399.999"), result.getDryWeight());
    assertEquals(new BigDecimal("8.3"), result.getPriorMoist());
    assertEquals(new BigDecimal("449.999"), result.getImbibedWeight());
    assertEquals(new BigDecimal("419.999"), result.getDrybackWeight());
    assertEquals(new BigDecimal("5.1"), result.getDrybackMoist());
    assertEquals(235, result.getDrybackTime());
    assertEquals(new BigDecimal("0.134"), result.getTargetThirtyMoist());
    assertEquals(new BigDecimal("0.157"), result.getTargetThirtyFiveMoist());
    assertEquals(new BigDecimal("399.999"), result.getStratEndWeight());
    assertEquals(new BigDecimal("8.4"), result.getStorageMc());

    verify(activityRepository).findDrybackScreenDataByRiaSkey(riaSkey);
  }
}
