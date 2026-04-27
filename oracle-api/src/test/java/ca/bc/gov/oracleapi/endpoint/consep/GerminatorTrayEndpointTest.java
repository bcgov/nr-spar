package ca.bc.gov.oracleapi.endpoint.consep;

import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.consep.GerminatorIdAssignResponseDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayContentsDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayCreateDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayCreateResponseDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTraySearchRequestDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTraySearchResponseDto;
import ca.bc.gov.oracleapi.service.consep.GerminatorTrayService;
import ca.bc.gov.oracleapi.service.consep.TestResultService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
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
import org.springframework.web.server.ResponseStatusException;

@WebMvcTest(GerminatorTrayEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_TSC_SUPERVISOR")
class GerminatorTrayEndpointTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @MockBean
  private TestResultService testResultService;

  @MockBean
  private GerminatorTrayService germinatorTrayService;

  private static final String BASE_URL = "/api/germinator-trays";

  /* ----------------------- Assign Germinator Trays ----------------------*/
  @Test
  void assignGerminatorTrays_returns201AndBody_andCallsService() throws Exception {
    // Arrange - use current time for payload
    LocalDateTime now = LocalDateTime.now();
    List<GerminatorTrayCreateDto> requests = List.of(
        new GerminatorTrayCreateDto("G10", new BigDecimal("881191"), null),
        new GerminatorTrayCreateDto("G12", new BigDecimal("881192"), now)
    );

    // Prepare service response
    LocalDateTime trayStart = LocalDate.now().atStartOfDay();
    List<GerminatorTrayCreateResponseDto> responses = List.of(
        new GerminatorTrayCreateResponseDto("G10", 101, trayStart),
        new GerminatorTrayCreateResponseDto("G12", 102, trayStart)
    );

    when(testResultService.assignGerminatorTrays(any())).thenReturn(responses);

    // Act / Assert
    mockMvc.perform(post(BASE_URL)
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(requests)))
        .andExpect(status().isCreated())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.length()").value(2))
        .andExpect(jsonPath("$[0].activityTypeCd").value("G10"))
        .andExpect(jsonPath("$[0].germinatorTrayId").value(101))
        .andExpect(jsonPath("$[1].germinatorTrayId").value(102));

    // Verify service was called with the same request object (record equals should match)
    verify(testResultService, times(1)).assignGerminatorTrays(requests);
  }

  @Test
  void assignGerminatorTrays_propagatesBadRequestFromService_andCallsService() throws Exception {
    // Arrange - empty request list
    List<GerminatorTrayCreateDto> requests = List.of();

    when(testResultService.assignGerminatorTrays(any()))
        .thenThrow(new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Create germinator tray request list cannot be null or empty"
        ));

    // Act / Assert
    mockMvc.perform(post(BASE_URL)
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(requests)))
        .andExpect(status().isBadRequest());

    // Verify that the service was invoked
    verify(testResultService, times(1)).assignGerminatorTrays(requests);
  }

  @Test
  void assignGerminatorTrays_propagatesNotFoundWhenActivitiesMissing_andCallsService()
      throws Exception {
    // Arrange - request list with one valid-looking entry
    List<GerminatorTrayCreateDto> requests = List.of(
        new GerminatorTrayCreateDto("G10", new BigDecimal("881191"), LocalDateTime.now())
    );
    when(testResultService.assignGerminatorTrays(any()))
        .thenThrow(new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Activities not found for provided SRM IDs"
        ));
    // Act / Assert
    mockMvc.perform(post(BASE_URL)
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(requests)))
        .andExpect(status().isNotFound());
    // Verify that the service was invoked
    verify(testResultService, times(1)).assignGerminatorTrays(requests);
  }

  @Test
  void assignGerminatorTrays_propagatesNotFoundWhenTestResultDatesMissing_andCallsService()
      throws Exception {
    // Arrange - request list with one valid-looking entry
    List<GerminatorTrayCreateDto> requests = List.of(
        new GerminatorTrayCreateDto("G12", new BigDecimal("881192"), LocalDateTime.now())
    );
    when(testResultService.assignGerminatorTrays(any()))
        .thenThrow(new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Test result dates are missing for provided activities"
        ));
    // Act / Assert
    mockMvc.perform(post(BASE_URL)
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(requests)))
        .andExpect(status().isNotFound());
    // Verify that the service was invoked
    verify(testResultService, times(1)).assignGerminatorTrays(requests);
  }

  @Test
  void assignGerminatorTrays_returns400_whenRequestBodyIsNull() throws Exception {
    // Act / Assert - sending null body should result in bad request
    mockMvc.perform(post(BASE_URL)
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON).content(""))
        .andExpect(status().isBadRequest());

    // Verify service was NOT called due to request validation failure
    verify(testResultService, times(0)).assignGerminatorTrays(any());
  }

  @Test
  void assignGerminatorTrays_returns400_whenActivityTypeCdIsBlank() throws Exception {
    // Arrange - invalid request with blank activity type
    List<GerminatorTrayCreateDto> requests = List.of(
        new GerminatorTrayCreateDto(
          "",
          new BigDecimal("881191"),
          LocalDateTime.now()
        )
    );

    // Act / Assert
    mockMvc.perform(post(BASE_URL)
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(requests)))
        .andExpect(status().isBadRequest());

    // Verify service was NOT called due to request validation failure
    verify(testResultService, times(0)).assignGerminatorTrays(any());
  }

  @Test
  void assignGerminatorTrays_returns400_whenRiaKeyIsNull() throws Exception {
    // Arrange - invalid request with null RIA key
    String invalidJson = "[{\"activityTypeCd\":\"G10\",\"riaSkey\":null}]";

    // Act / Assert
    mockMvc.perform(post(BASE_URL)
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(invalidJson))
        .andExpect(status().isBadRequest());

    // Verify service was NOT called due to request validation failure
    verify(testResultService, times(0)).assignGerminatorTrays(any());
  }

  /* ----------------------- Assign Germinator Id to Trays ----------------------*/
  @Test
  void assignGerminatorIdToTray_returns200AndBody_andCallsService() throws Exception {
    // Arrange
    Integer germinatorTrayId = 101;
    String germinatorId = "1";

    GerminatorIdAssignResponseDto response =
        new GerminatorIdAssignResponseDto(germinatorTrayId, germinatorId);

    when(germinatorTrayService.assignGerminatorIdToTray(germinatorTrayId, germinatorId))
        .thenReturn(response);

    // Act / Assert
    mockMvc
        .perform(
            patch(BASE_URL + "/" + germinatorTrayId + "/germinator-id")
                .with(csrf())
                .param("germinatorId", germinatorId)
                .contentType(MediaType.APPLICATION_JSON)
        )
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.germinatorTrayId").value(101))
        .andExpect(jsonPath("$.germinatorId").value("1"));

    verify(germinatorTrayService, times(1))
        .assignGerminatorIdToTray(germinatorTrayId, germinatorId);
  }

  @ParameterizedTest
  @ValueSource(ints = {0, -1})
  void assignGerminatorIdToTray_returns400_whenTrayIdNotPositive(Integer germinatorTrayId)
      throws Exception {
    mockMvc
        .perform(
            patch(BASE_URL + "/" + germinatorTrayId + "/germinator-id")
                .with(csrf())
                .param("germinatorId", "1")
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isBadRequest());

    verify(germinatorTrayService, times(0)).assignGerminatorIdToTray(any(), any());
  }

  @Test
  void assignGerminatorIdToTray_returns404_whenTrayNotFound() throws Exception {
    Integer germinatorTrayId = 999;
    String germinatorId = "1";

    when(germinatorTrayService.assignGerminatorIdToTray(germinatorTrayId, germinatorId))
        .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND,
            "Germinator tray not found with ID: " + germinatorTrayId));

    mockMvc
        .perform(
            patch(BASE_URL + "/" + germinatorTrayId + "/germinator-id")
                .with(csrf())
                .param("germinatorId", germinatorId)
                .contentType(MediaType.APPLICATION_JSON)
        )
        .andExpect(status().isNotFound());

    verify(germinatorTrayService, times(1))
        .assignGerminatorIdToTray(germinatorTrayId, germinatorId);
  }

  @Test
  void assignGerminatorIdToTray_returns200_whenGerminatorIdBlank_unsetsValue() throws Exception {
    int germinatorTrayId = 101;
    String germinatorId = "";

    GerminatorIdAssignResponseDto response =
        new GerminatorIdAssignResponseDto(germinatorTrayId, null);

    when(germinatorTrayService.assignGerminatorIdToTray(germinatorTrayId, germinatorId))
        .thenReturn(response);

    mockMvc
        .perform(
            patch(BASE_URL + "/" + germinatorTrayId + "/germinator-id")
                .with(csrf())
                .param("germinatorId", germinatorId)
                .contentType(MediaType.APPLICATION_JSON)
        )
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.germinatorTrayId").value(germinatorTrayId))
        .andExpect(jsonPath("$.germinatorId").value(nullValue()));

    verify(germinatorTrayService, times(1))
        .assignGerminatorIdToTray(germinatorTrayId, germinatorId);
  }

  @Test
  void assignGerminatorIdToTray_returns400_whenGerminatorIdExceedsRange() throws Exception {
    int germinatorTrayId = 101;
    String invalidGerminatorId = "10"; // exceeds max of 9

    mockMvc
        .perform(
            patch(BASE_URL + "/" + germinatorTrayId + "/germinator-id")
                .with(csrf())
                .param("germinatorId", invalidGerminatorId)
                .contentType(MediaType.APPLICATION_JSON)
        )
        .andExpect(status().isBadRequest());
  }

  @ParameterizedTest
  @ValueSource(ints = {0, 1, 5, 9})
  void assignGerminatorIdToTray_returns200_withValidNumericIds(Integer germinatorId)
      throws Exception {
    Integer germinatorTrayId = 101;
    GerminatorIdAssignResponseDto response =
        new GerminatorIdAssignResponseDto(germinatorTrayId, germinatorId.toString());

    when(germinatorTrayService.assignGerminatorIdToTray(germinatorTrayId, germinatorId.toString()))
        .thenReturn(response);

    mockMvc
        .perform(
            patch(BASE_URL + "/" + germinatorTrayId + "/germinator-id")
                .with(csrf())
                .param("germinatorId", germinatorId.toString())
                .contentType(MediaType.APPLICATION_JSON)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.germinatorId").value(germinatorId.toString()));
  }

  @Test
  void assignGerminatorIdToTray_returns400_whenGerminatorIdParamMissing() throws Exception {
    int germinatorTrayId = 101;

    // No param -> Spring sees missing required @RequestParam -> 400
    mockMvc
        .perform(
            patch(BASE_URL + "/" + germinatorTrayId + "/germinator-id")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
        )
        .andExpect(status().isBadRequest());

    verify(germinatorTrayService, times(0))
        .assignGerminatorIdToTray(any(), any());
  }

  /* ----------------------- Get Tests by Tray ID ----------------------*/
  @Test
  void getTestsByTrayId_returns200AndList_andCallsService() throws Exception {
    Integer germinatorTrayId = 101;
    List<GerminatorTrayContentsDto> contents =
        List.of(
            new GerminatorTrayContentsDto(
                germinatorTrayId,
                "RTS20042360",
                "A",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
            ));

    when(germinatorTrayService.getTrayContents(germinatorTrayId)).thenReturn(contents);

    mockMvc
        .perform(
            get(BASE_URL + "/" + germinatorTrayId + "/tests")
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].germinatorTrayId").value(101))
        .andExpect(jsonPath("$[0].requestId").value("RTS20042360"))
        .andExpect(jsonPath("$[0].seedlotNumber").value("A"))
        .andExpect(jsonPath("$[0].warmStratStartDate").value(nullValue()))
        .andExpect(jsonPath("$[0].drybackStartDate").value(nullValue()))
        .andExpect(jsonPath("$[0].germinatorEntry").value(nullValue()))
        .andExpect(jsonPath("$[0].stratStartDate").value(nullValue()))
        .andExpect(jsonPath("$[0].updateTimestamp").value(nullValue()));

    verify(germinatorTrayService, times(1)).getTrayContents(germinatorTrayId);
  }

  @ParameterizedTest
  @ValueSource(ints = {0, -1})
  void getTestsByTrayId_returns400_whenTrayIdNotPositive(Integer germinatorTrayId)
      throws Exception {
    mockMvc
        .perform(
            get(BASE_URL + "/" + germinatorTrayId + "/tests")
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isBadRequest());

    verify(germinatorTrayService, times(0)).getTrayContents(any());
  }

  @Test
  void getTestsByTrayId_returns404_whenTrayNotFound() throws Exception {
    Integer germinatorTrayId = 999;

    when(germinatorTrayService.getTrayContents(germinatorTrayId))
        .thenThrow(
            new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Germinator tray not found with ID: " + germinatorTrayId));

    mockMvc
        .perform(
            get(BASE_URL + "/" + germinatorTrayId + "/tests")
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());

    verify(germinatorTrayService, times(1)).getTrayContents(germinatorTrayId);
  }

  @Test
  @WithAnonymousUser
  void getTestsByTrayId_returns401_whenUnauthorized() throws Exception {
    mockMvc
        .perform(get(BASE_URL + "/101/tests").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized());

    verify(germinatorTrayService, times(0)).getTrayContents(any());
  }

  @Test
  @WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
  void getTestsByTrayId_returns403_whenUserDoesNotHaveRequiredRole() throws Exception {
    mockMvc
        .perform(get(BASE_URL + "/101/tests").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isForbidden());

    verify(germinatorTrayService, times(0)).getTrayContents(any());
  }

  /* ----------------------- Search germinator trays ----------------------*/
  @Test
  void searchGerminatorTrays_returns200AndList_andCallsService() throws Exception {
    GerminatorTraySearchRequestDto request =
        new GerminatorTraySearchRequestDto("30350", "TST20250025");

    List<GerminatorTraySearchResponseDto> response =
        List.of(
            new GerminatorTraySearchResponseDto(
                1311,
                "G10",
                LocalDateTime.of(2025, 3, 12, 0, 0),
                LocalDateTime.of(2025, 3, 11, 15, 26),
                0L,
                2,
                "4"));

    when(germinatorTrayService.searchGerminatorTrays(request)).thenReturn(response);

    mockMvc
        .perform(
            post(BASE_URL + "/search")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].germinatorTrayId").value(1311))
        .andExpect(jsonPath("$[0].activityTypeCd").value("G10"))
        .andExpect(jsonPath("$[0].systemTrayNo").value(2));

    verify(germinatorTrayService, times(1)).searchGerminatorTrays(request);
  }

  @Test
  void searchGerminatorTrays_returns400_whenServiceRejectsOpenSearch() throws Exception {
    GerminatorTraySearchRequestDto request = new GerminatorTraySearchRequestDto(null, null);

    when(germinatorTrayService.searchGerminatorTrays(request))
        .thenThrow(
            new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "At least one search criterion is required"));

    mockMvc
        .perform(
            post(BASE_URL + "/search")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest());

    verify(germinatorTrayService, times(1)).searchGerminatorTrays(request);
  }

  @Test
  void searchGerminatorTrays_returns400_whenRequestValidationFails() throws Exception {
    String invalidJson =
        """
        {
          "seedlotOrFamilyLot": "30350",
          "requestIdOrItem": "TST-2025"
        }
        """;

    mockMvc
        .perform(
            post(BASE_URL + "/search")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
        .andExpect(status().isBadRequest());

    verify(germinatorTrayService, times(0)).searchGerminatorTrays(any());
  }

  @Test
  void searchGerminatorTrays_returns400_whenRequestIdTooShort() throws Exception {
    String invalidJson =
        """
        {
          "seedlotOrFamilyLot": "30350",
          "requestIdOrItem": "TST2025"
        }
        """;

    mockMvc
        .perform(
            post(BASE_URL + "/search")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
        .andExpect(status().isBadRequest());

    verify(germinatorTrayService, times(0)).searchGerminatorTrays(any());
  }

  @Test
  void searchGerminatorTrays_returns400_whenRequestIdTooLong() throws Exception {
    String invalidJson =
        """
        {
          "seedlotOrFamilyLot": "30350",
          "requestIdOrItem": "TST20250025BC"
        }
        """;

    mockMvc
        .perform(
            post(BASE_URL + "/search")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
        .andExpect(status().isBadRequest());

    verify(germinatorTrayService, times(0)).searchGerminatorTrays(any());
  }

  @Test
  void searchGerminatorTrays_returns400_whenFamilyLotInvalidFormat() throws Exception {
    String invalidJson =
        """
        {
          "seedlotOrFamilyLot": "ABC123",
          "requestIdOrItem": "TST20250025"
        }
        """;

    mockMvc
        .perform(
            post(BASE_URL + "/search")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
        .andExpect(status().isBadRequest());

    verify(germinatorTrayService, times(0)).searchGerminatorTrays(any());
  }

  @Test
  void searchGerminatorTrays_returns200_whenValidFamilyLotAndRequestItem() throws Exception {
    GerminatorTraySearchRequestDto request =
        new GerminatorTraySearchRequestDto("FMLY12345", "TST20250025B");

    List<GerminatorTraySearchResponseDto> response =
        List.of(
            new GerminatorTraySearchResponseDto(
                1311,
                "G10",
                LocalDateTime.of(2025, 3, 12, 0, 0),
                LocalDateTime.of(2025, 3, 11, 15, 26),
                0L,
                2,
                "4"));

    when(germinatorTrayService.searchGerminatorTrays(request)).thenReturn(response);

    mockMvc
        .perform(
            post(BASE_URL + "/search")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].germinatorTrayId").value(1311));

    verify(germinatorTrayService, times(1)).searchGerminatorTrays(request);
  }

  /* ----------------------- Delete Tray ----------------------*/
  @Test
  void deleteTray_returns204_whenSuccessful() throws Exception {
    Integer germinatorTrayId = 101;
    LocalDateTime expectedTimestamp = LocalDateTime.parse("2025-03-12T00:00:00");
    String timestamp = "2025-03-12T00:00:00";

    doNothing().when(germinatorTrayService).deleteTray(germinatorTrayId, expectedTimestamp);

    mockMvc
        .perform(
            delete(BASE_URL + "/" + germinatorTrayId)
                .with(csrf())
                .param("activityUpdateTimestamp", timestamp))
        .andExpect(status().isNoContent());

    verify(germinatorTrayService, times(1)).deleteTray(germinatorTrayId, expectedTimestamp);
  }

  @Test
  void deleteTray_returns400_whenTimestampParamMissing() throws Exception {
    // Missing required activityUpdateTimestamp param -> 400
    mockMvc.perform(delete(BASE_URL + "/101").with(csrf())).andExpect(status().isBadRequest());

    verify(germinatorTrayService, times(0)).deleteTray(any(), any());
  }

  @Test
  void deleteTray_returns404_whenTrayNotFound() throws Exception {
    Integer germinatorTrayId = 999;
    LocalDateTime expectedTimestamp = LocalDateTime.parse("2025-03-12T00:00:00");
    String timestamp = "2025-03-12T00:00:00";

    doThrow(
            new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Germinator tray not found with ID: " + germinatorTrayId))
        .when(germinatorTrayService)
        .deleteTray(germinatorTrayId, expectedTimestamp);

    mockMvc
        .perform(
            delete(BASE_URL + "/" + germinatorTrayId)
                .with(csrf())
                .param("activityUpdateTimestamp", timestamp))
        .andExpect(status().isNotFound());

    verify(germinatorTrayService, times(1)).deleteTray(germinatorTrayId, expectedTimestamp);
  }

  @Test
  void deleteTray_returns409_whenOptimisticConcurrencyConflict() throws Exception {
    Integer germinatorTrayId = 101;
    LocalDateTime expectedTimestamp = LocalDateTime.parse("2025-03-12T00:00:00");
    String timestamp = "2025-03-12T00:00:00";

    doThrow(
            new ResponseStatusException(
                HttpStatus.CONFLICT, GerminatorTrayService.RESELECT_MESSAGE))
        .when(germinatorTrayService)
        .deleteTray(germinatorTrayId, expectedTimestamp);

    mockMvc
        .perform(
            delete(BASE_URL + "/" + germinatorTrayId)
                .with(csrf())
                .param("activityUpdateTimestamp", timestamp))
        .andExpect(status().isConflict());

    verify(germinatorTrayService, times(1)).deleteTray(germinatorTrayId, expectedTimestamp);
  }

  @Test
  @WithAnonymousUser
  void deleteTray_returns401_whenUnauthorized() throws Exception {
    mockMvc
        .perform(
            delete(BASE_URL + "/101")
                .with(csrf())
                .param("activityUpdateTimestamp", "2025-03-12T00:00:00"))
        .andExpect(status().isUnauthorized());

    verify(germinatorTrayService, times(0)).deleteTray(any(), any());
  }

  @Test
  @WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
  void deleteTray_returns403_whenUserDoesNotHaveRequiredRole() throws Exception {
    mockMvc
        .perform(
            delete(BASE_URL + "/101")
                .with(csrf())
                .param("activityUpdateTimestamp", "2025-03-12T00:00:00"))
        .andExpect(status().isForbidden());

    verify(germinatorTrayService, times(0)).deleteTray(any(), any());
  }

  /* ----------------------- Delete Test from Tray ----------------------*/
  @Test
  void deleteTestFromTray_returns204_whenSuccessful() throws Exception {
    Integer germinatorTrayId = 101;
    BigDecimal riaSkey = new BigDecimal("881191");
    LocalDateTime expectedTimestamp = LocalDateTime.parse("2025-03-12T00:00:00");
    String timestamp = "2025-03-12T00:00:00";

    doNothing()
        .when(germinatorTrayService)
        .deleteTestFromTray(germinatorTrayId, riaSkey, expectedTimestamp);

    mockMvc
        .perform(
            delete(BASE_URL + "/" + germinatorTrayId + "/tests/" + riaSkey)
                .with(csrf())
                .param("activityUpdateTimestamp", timestamp))
        .andExpect(status().isNoContent());

    verify(germinatorTrayService, times(1))
        .deleteTestFromTray(germinatorTrayId, riaSkey, expectedTimestamp);
  }

  @Test
  void deleteTestFromTray_returns400_whenTimestampParamMissing() throws Exception {
    // Missing required activityUpdateTimestamp param -> 400
    mockMvc
        .perform(delete(BASE_URL + "/101/tests/881191").with(csrf()))
        .andExpect(status().isBadRequest());

    verify(germinatorTrayService, times(0)).deleteTestFromTray(any(), any(), any());
  }

  @Test
  void deleteTestFromTray_returns409_whenOptimisticConcurrencyConflict() throws Exception {
    Integer germinatorTrayId = 101;
    BigDecimal riaSkey = new BigDecimal("881191");
    LocalDateTime expectedTimestamp = LocalDateTime.parse("2025-03-12T00:00:00");
    String timestamp = "2025-03-12T00:00:00";

    doThrow(
            new ResponseStatusException(
                HttpStatus.CONFLICT, GerminatorTrayService.RESELECT_MESSAGE))
        .when(germinatorTrayService)
        .deleteTestFromTray(germinatorTrayId, riaSkey, expectedTimestamp);

    mockMvc
        .perform(
            delete(BASE_URL + "/" + germinatorTrayId + "/tests/" + riaSkey)
                .with(csrf())
                .param("activityUpdateTimestamp", timestamp))
        .andExpect(status().isConflict());

    verify(germinatorTrayService, times(1))
        .deleteTestFromTray(germinatorTrayId, riaSkey, expectedTimestamp);
  }

  @Test
  void deleteTestFromTray_returns404_whenTestNotFound() throws Exception {
    Integer germinatorTrayId = 101;
    BigDecimal riaSkey = new BigDecimal("999999");
    LocalDateTime expectedTimestamp = LocalDateTime.parse("2025-03-12T00:00:00");
    String timestamp = "2025-03-12T00:00:00";

    doThrow(
            new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Test not found for RIA_SKEY: " + riaSkey))
        .when(germinatorTrayService)
        .deleteTestFromTray(germinatorTrayId, riaSkey, expectedTimestamp);

    mockMvc
        .perform(
            delete(BASE_URL + "/" + germinatorTrayId + "/tests/" + riaSkey)
                .with(csrf())
                .param("activityUpdateTimestamp", timestamp))
        .andExpect(status().isNotFound());

    verify(germinatorTrayService, times(1))
        .deleteTestFromTray(germinatorTrayId, riaSkey, expectedTimestamp);
  }

  @Test
  @WithAnonymousUser
  void deleteTestFromTray_returns401_whenUnauthorized() throws Exception {
    mockMvc
        .perform(
            delete(BASE_URL + "/101/tests/881191")
                .with(csrf())
                .param("activityUpdateTimestamp", "2025-03-12T00:00:00"))
        .andExpect(status().isUnauthorized());

    verify(germinatorTrayService, times(0)).deleteTestFromTray(any(), any(), any());
  }

  @Test
  @WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
  void deleteTestFromTray_returns403_whenUserDoesNotHaveRequiredRole() throws Exception {
    mockMvc
        .perform(
            delete(BASE_URL + "/101/tests/881191")
                .with(csrf())
                .param("activityUpdateTimestamp", "2025-03-12T00:00:00"))
        .andExpect(status().isForbidden());

    verify(germinatorTrayService, times(0)).deleteTestFromTray(any(), any(), any());
  }
}
