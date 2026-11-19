package ca.bc.gov.oracleapi.endpoint.consep;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.consep.DrybackScreenDto;
import ca.bc.gov.oracleapi.service.consep.DrybackScreenService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.web.server.ResponseStatusException;

/**
 * Unit tests for DrybackScreenEndpoint.
 * Tests the G64 Dryback Calculation screen data retrieval endpoint.
 */
@WebMvcTest(DrybackScreenEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_TSC_SUPERVISOR")
@DisplayName("DrybackScreenEndpoint Tests")
public class DrybackScreenEndpointTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private DrybackScreenService drybackScreenService;

  private static final String BASE_URL = "/api/dryback";

  /**
   * Test: Valid riaSkey returns 200 OK with dryback screen data.
   * Verifies that all required fields are returned in the response.
   */
  @Test
  @DisplayName("getDrybackScreenData returns 200 with valid riaSkey")
  void getDrybackScreenData_returns200_withValidRiaSkey() throws Exception {
    BigDecimal riaSkey = new BigDecimal("7338");
    LocalDateTime now = LocalDateTime.now();

    DrybackScreenDto response = new DrybackScreenDto(
        riaSkey,
        "00001234",           // requestId
        "1",                  // itemId
        "01234",              // seedlotNumber
        "0123456789012",      // familyLotNumber
        "G64",                // standardActivityId
        "G64",                // activityTypeCode
        now,                  // actualBeginDateTime
        now.plusHours(8),     // actualEndDateTime
        new BigDecimal("400.123"),  // dryWeight
        new BigDecimal("8.5"),      // priorMoist
        new BigDecimal("450.456"),  // imbibedWeight
        new BigDecimal("420.789"),  // drybackWeight
        new BigDecimal("5.2"),      // drybackMoist
        240,                  // drybackTime (minutes)
        new BigDecimal("0.135"),    // targetThirtyMoist
        new BigDecimal("0.158"),    // targetThirtyFiveMoist
        new BigDecimal("400.000"),  // stratEndWeight
        new BigDecimal("8.5"),      // storageMc
        "Sample notes",       // riaComment
        now                   // updateTimestamp
    );

    when(drybackScreenService.getDrybackScreenData(riaSkey)).thenReturn(response);

    mockMvc
        .perform(get(BASE_URL + "/{riaSkey}", riaSkey))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.riaSkey").value(7338))
        .andExpect(jsonPath("$.requestId").value("00001234"))
        .andExpect(jsonPath("$.seedlotNumber").value("01234"))
        .andExpect(jsonPath("$.standardActivityId").value("G64"))
        .andExpect(jsonPath("$.dryWeight").value("400.123"))
        .andExpect(jsonPath("$.storageMc").value("8.5"))
        .andExpect(jsonPath("$.drybackTime").value(240));

    verify(drybackScreenService).getDrybackScreenData(riaSkey);
  }

  /**
   * Test: Valid riaSkey with no accepted MC test returns 200 with storageMc null.
   * Verifies that the API still returns 200 OK and the RIA data when no MC test exists.
   */
  @Test
  @DisplayName("getDrybackScreenData returns 200 with storageMc null when no accepted MC test")
  void getDrybackScreenData_returns200WithNullStorageMc_whenNoAcceptedMc() throws Exception {
    BigDecimal riaSkey = new BigDecimal("7339");
    LocalDateTime now = LocalDateTime.now();

    DrybackScreenDto response = new DrybackScreenDto(
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

    when(drybackScreenService.getDrybackScreenData(riaSkey)).thenReturn(response);

    mockMvc
        .perform(get(BASE_URL + "/{riaSkey}", riaSkey))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.riaSkey").value(7339))
        .andExpect(jsonPath("$.storageMc").doesNotExist());

    verify(drybackScreenService).getDrybackScreenData(riaSkey);
  }

  /**
   * Test: Invalid riaSkey (does not exist) returns 404 Not Found.
   */
  @Test
  @DisplayName("getDrybackScreenData returns 404 when riaSkey not found")
  void getDrybackScreenData_returns404_whenRiaskeyNotFound() throws Exception {
    BigDecimal invalidRiaSkey = new BigDecimal("99999");

    when(drybackScreenService.getDrybackScreenData(invalidRiaSkey))
        .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Activity not found"));

    mockMvc
        .perform(get(BASE_URL + "/{riaSkey}", invalidRiaSkey))
        .andExpect(status().isNotFound());

    verify(drybackScreenService).getDrybackScreenData(invalidRiaSkey);
  }

  /**
   * Test: Invalid path parameter (non-positive) returns 400 Bad Request.
   */
  @ParameterizedTest
  @ValueSource(strings = {"0", "-1", "-1000"})
  @DisplayName("getDrybackScreenData returns 400 when riaSkey not positive")
  void getDrybackScreenData_returns400_whenPathNotPositive(String badKey) throws Exception {
    mockMvc
        .perform(get(BASE_URL + "/{riaSkey}", badKey))
        .andExpect(status().isBadRequest());

    verifyNoInteractions(drybackScreenService);
  }

  /**
   * Test: Anonymous user (no authentication) returns 401 Unauthorized.
   */
  @Test
  @WithAnonymousUser
  @DisplayName("getDrybackScreenData returns 401 when anonymous")
  void getDrybackScreenData_returns401_whenAnonymous() throws Exception {
    BigDecimal riaSkey = new BigDecimal("7338");

    mockMvc
        .perform(get(BASE_URL + "/{riaSkey}", riaSkey))
        .andExpect(status().isUnauthorized());

    verifyNoInteractions(drybackScreenService);
  }

  /**
   * Test: User with unauthorized role returns 403 Forbidden.
   */
  @Test
  @WithMockUser(username = "SPARTest", roles = "SPAR_NON_ORACLE_USER")
  @DisplayName("getDrybackScreenData returns 403 when unauthorized role")
  void getDrybackScreenData_returns403_whenUnauthorizedRole() throws Exception {
    BigDecimal riaSkey = new BigDecimal("7338");

    mockMvc
        .perform(get(BASE_URL + "/{riaSkey}", riaSkey))
        .andExpect(status().isForbidden());

    verifyNoInteractions(drybackScreenService);
  }

  /**
   * Test: Service throws exception returns appropriate HTTP status.
   */
  @Test
  @DisplayName("getDrybackScreenData returns 400 when bad request from service")
  void getDrybackScreenData_returns400_whenBadRequest() throws Exception {
    BigDecimal riaSkey = new BigDecimal("7338");

    when(drybackScreenService.getDrybackScreenData(riaSkey))
        .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "riaSkey is required"));

    mockMvc
        .perform(get(BASE_URL + "/{riaSkey}", riaSkey))
        .andExpect(status().isBadRequest());

    verify(drybackScreenService).getDrybackScreenData(riaSkey);
  }

  // ==================== PUT (save) ====================

  private static final String SAVE_BODY = """
      {"actualBeginDateTime":"2026-03-04T09:00:00","drybackWeight":25.080,
       "drybackTime":%s,"riaComment":"saved","updateTimestamp":%s}
      """;

  private ResultActions putSave(String body)
      throws Exception {
    return mockMvc.perform(put(BASE_URL + "/{riaSkey}", new BigDecimal("7338"))
        .with(csrf().asHeader())
        .contentType(MediaType.APPLICATION_JSON)
        .content(body));
  }

  @Test
  @DisplayName("saveDryback returns 200 with refreshed data")
  void saveDryback_returns200() throws Exception {
    DrybackScreenDto refreshed = new DrybackScreenDto();
    refreshed.setRiaComment("saved");
    when(drybackScreenService.saveDryback(eq(new BigDecimal("7338")), any()))
        .thenReturn(refreshed);

    putSave(SAVE_BODY.formatted("65", "\"2026-03-01T08:00:00\""))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.riaComment").value("saved"));
  }

  @ParameterizedTest
  @ValueSource(strings = {"1000", "-1"})
  @DisplayName("saveDryback returns 400 when dryback time is out of range")
  void saveDryback_returns400_whenOutOfRange(String drybackTime) throws Exception {
    putSave(SAVE_BODY.formatted(drybackTime, "\"2026-03-01T08:00:00\""))
        .andExpect(status().isBadRequest());
    verifyNoInteractions(drybackScreenService);
  }

  @Test
  @DisplayName("saveDryback returns 400 when updateTimestamp is missing")
  void saveDryback_returns400_whenTimestampMissing() throws Exception {
    putSave(SAVE_BODY.formatted("65", "null")).andExpect(status().isBadRequest());
    verifyNoInteractions(drybackScreenService);
  }

  @Test
  @DisplayName("saveDryback returns 409 when the service reports a conflict")
  void saveDryback_returns409_onConflict() throws Exception {
    when(drybackScreenService.saveDryback(eq(new BigDecimal("7338")), any()))
        .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "modified"));

    putSave(SAVE_BODY.formatted("65", "\"2026-03-01T08:00:00\""))
        .andExpect(status().isConflict());
  }
}
