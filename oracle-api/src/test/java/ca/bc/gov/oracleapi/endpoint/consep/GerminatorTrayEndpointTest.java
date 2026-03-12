package ca.bc.gov.oracleapi.endpoint.consep;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayAssignGerminatorIdResponseDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayCreateDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayCreateResponseDto;
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

    GerminatorTrayAssignGerminatorIdResponseDto response =
        new GerminatorTrayAssignGerminatorIdResponseDto(germinatorTrayId, germinatorId);

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
  void assignGerminatorIdToTray_returns400_whenGerminatorIdBlank() throws Exception {
    int germinatorTrayId = 101;
    String germinatorId = "";

    mockMvc
        .perform(
            patch(BASE_URL + "/" + germinatorTrayId + "/germinator-id")
                .with(csrf())
                .param("germinatorId", germinatorId)
                .contentType(MediaType.APPLICATION_JSON)
        )
        .andExpect(status().isBadRequest());

    verify(germinatorTrayService, times(0))
        .assignGerminatorIdToTray(any(), any());
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
    GerminatorTrayAssignGerminatorIdResponseDto response =
        new GerminatorTrayAssignGerminatorIdResponseDto(germinatorTrayId, germinatorId.toString());

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
}
