package ca.bc.gov.oracleapi.endpoint.consep;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayAssignGerminatorIdDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayAssignGerminatorIdResponseDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayCreateDto;
import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayCreateResponseDto;
import ca.bc.gov.oracleapi.service.consep.TestResultService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
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

  private static final String BASE_URL = "/api/germinator-trays";

  @Test
  void assignGerminatorTrays_returns200AndBody_andCallsService() throws Exception {
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
        .andExpect(status().isOk())
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
  void assignGerminatorIdToTray_returns200AndBody_andCallsService() throws Exception {
    // Arrange
    Integer germinatorTrayId = 101;
    String germinatorId = "A";
    GerminatorTrayAssignGerminatorIdDto request =
        new GerminatorTrayAssignGerminatorIdDto(germinatorTrayId, germinatorId);

    GerminatorTrayAssignGerminatorIdResponseDto response =
        new GerminatorTrayAssignGerminatorIdResponseDto(
            germinatorTrayId,
            germinatorId
        );

    when(testResultService.assignGerminatorIdToTray(any())).thenReturn(response);

    // Act / Assert
    mockMvc.perform(patch(BASE_URL + "/" + germinatorTrayId + "/germinator-id")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.germinatorTrayId").value(101))
        .andExpect(jsonPath("$.germinatorId").value("A"));

    // Verify service was called
    verify(testResultService, times(1)).assignGerminatorIdToTray(request);
  }

  @Test
  void assignGerminatorIdToTray_returns404_whenTrayNotFound() throws Exception {
    // Arrange
    Integer germinatorTrayId = 999;
    String germinatorId = "A";
    GerminatorTrayAssignGerminatorIdDto request =
        new GerminatorTrayAssignGerminatorIdDto(germinatorTrayId, germinatorId);

    when(testResultService.assignGerminatorIdToTray(any()))
        .thenThrow(new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Germinator tray not found with ID: " + germinatorTrayId
        ));

    // Act / Assert
    mockMvc.perform(patch(BASE_URL + "/" + germinatorTrayId + "/germinator-id")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isNotFound());

    // Verify service was called
    verify(testResultService, times(1)).assignGerminatorIdToTray(request);
  }

  @Test
  void assignGerminatorIdToTray_returns400_whenPathAndBodyIdMismatch() throws Exception {
    // Arrange - path has ID 101 but body has ID 102
    Integer pathTrayId = 101;
    Integer bodyTrayId = 102;
    String germinatorId = "A";
    GerminatorTrayAssignGerminatorIdDto request =
        new GerminatorTrayAssignGerminatorIdDto(bodyTrayId, germinatorId);

    // Act / Assert
    mockMvc.perform(patch(BASE_URL + "/" + pathTrayId + "/germinator-id")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest());

    // Verify service was NOT called because validation failed
    verify(testResultService, times(0)).assignGerminatorIdToTray(any());
  }

  @Test
  void whenGerminatorIdBlank() throws Exception {
    // Arrange - empty germinator ID
    Integer germinatorTrayId = 101;
    GerminatorTrayAssignGerminatorIdDto request =
        new GerminatorTrayAssignGerminatorIdDto(germinatorTrayId, "");

    // Act / Assert
    mockMvc.perform(patch(BASE_URL + "/" + germinatorTrayId + "/germinator-id")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest());

    // Verify service was NOT called because validation failed
    verify(testResultService, times(0)).assignGerminatorIdToTray(any());
  }
}
