package ca.bc.gov.oracleapi.endpoint.consep;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.consep.ActivityFormDto;
import ca.bc.gov.oracleapi.dto.consep.MccAutosaveFormDto;
import ca.bc.gov.oracleapi.dto.consep.MccReplicateDto;
import ca.bc.gov.oracleapi.dto.consep.MccReplicateFormDto;
import ca.bc.gov.oracleapi.dto.consep.MoistureContentConesDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.exception.InvalidTestActivityKeyException;
import ca.bc.gov.oracleapi.service.consep.ActivityService;
import ca.bc.gov.oracleapi.service.consep.MoistureContentService;
import ca.bc.gov.oracleapi.service.consep.TestResultService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

@WebMvcTest(MoistureContentConesEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_TSC_SUPERVISOR")
class MoistureContentConesEndpointTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private MoistureContentService moistureContentService;

  @MockBean
  private ActivityService activityService;

  @MockBean
  private TestResultService testResultService;

  @InjectMocks
  private MoistureContentConesEndpoint moistureContentConesEndpoint;

  @Autowired
  private ObjectMapper objectMapper;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    mockMvc = MockMvcBuilders.standaloneSetup(moistureContentConesEndpoint).build();
  }

  private final ObjectMapper mapper = new ObjectMapper()
        .registerModule(new JavaTimeModule())
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

  @Test
  @DisplayName("Get a MCC data for a seedlot should succeed")
  void getMccData_shouldSucceed() throws Exception {
    MccReplicateDto replicate1 = new MccReplicateDto(
        new BigDecimal(1234567890),
        1,
        "A123",
        new BigDecimal(12.345),
        new BigDecimal(45.678),
        new BigDecimal(58.901),
        new BigDecimal(46.789),
        1,
        "Replicate was re-tested due to abnormal moisture content.",
        "Equipment calibration issue."
    );
    MccReplicateDto replicate2 = new MccReplicateDto(
        new BigDecimal(1234567890),
        2,
        "B456",
        new BigDecimal(12.345),
        new BigDecimal(45.678),
        new BigDecimal(58.901),
        new BigDecimal(46.789),
        2,
        "Replicate passed all tests successfully.",
        "No issues."
    );
    List<MccReplicateDto> replicatesList = List.of(replicate1, replicate2);
    Optional<MoistureContentConesDto> moistureContent = Optional.of(
        new MoistureContentConesDto(
            1,
            "Sample description",
            "MOI",
            new BigDecimal(12.345),
            1,
            "ABC123456",
            "60000",
            null,
            "A",
            "PLI",
            "MC",
            "TST",
            "Comment for this content",
            LocalDateTime.parse("2013-08-01T00:00:00"),
            LocalDateTime.parse("2013-08-01T00:00:00"),
            LocalDateTime.parse("2013-08-01T00:00:00"),
            "MCM",
            replicatesList
        ));

    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    BigDecimal riaKey = new BigDecimal(1234567890);
    when(moistureContentService.getMoistureConeContentData(riaKey)).thenReturn(moistureContent);

    mockMvc
        .perform(
            get("/api/moisture-content-cone/{riaKey}", riaKey)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.testCompleteInd").value(moistureContent.get().testCompleteInd()))
        .andExpect(jsonPath("$.sampleDesc").value(moistureContent.get().sampleDesc()))
        .andExpect(jsonPath("$.moistureStatus").value(moistureContent.get().moistureStatus()))
        .andExpect(jsonPath("$.moisturePct").value(moistureContent.get().moisturePct()))
        .andExpect(jsonPath("$.acceptResult").value(moistureContent.get().acceptResult()))
        .andExpect(jsonPath("$.requestId").value(moistureContent.get().requestId()))
        .andExpect(jsonPath("$.seedlotNumber").value(moistureContent.get().seedlotNumber()))
        .andExpect(jsonPath("$.activityType").value(moistureContent.get().activityType()))
        .andExpect(jsonPath("$.testCategoryCode").value(moistureContent.get().testCategoryCode()))
        .andExpect(jsonPath("$.riaComment").value(moistureContent.get().riaComment()))
        .andExpect(jsonPath("$.actualBeginDateTime")
            .value(moistureContent.get().actualBeginDateTime().format(formatter)))
        .andExpect(jsonPath("$.actualEndDateTime")
            .value(moistureContent.get().actualEndDateTime().format(formatter)))
        .andExpect(jsonPath("$.replicatesList[0].riaKey")
            .value(moistureContent.get().replicatesList().get(0).riaKey()))
        .andExpect(jsonPath("$.replicatesList[0].replicateNumber")
            .value(moistureContent.get().replicatesList().get(0).replicateNumber()))
        .andExpect(jsonPath("$.replicatesList[0].containerId")
            .value(moistureContent.get().replicatesList().get(0).containerId()))
        .andExpect(jsonPath("$.replicatesList[0].containerWeight")
            .value(moistureContent.get().replicatesList().get(0).containerWeight()))
        .andExpect(jsonPath("$.replicatesList[0].freshSeed")
            .value(moistureContent.get().replicatesList().get(0).freshSeed()))
        .andExpect(jsonPath("$.replicatesList[0].containerAndDryWeight")
            .value(moistureContent.get().replicatesList().get(0).containerAndDryWeight()))
        .andExpect(jsonPath("$.replicatesList[0].dryWeight")
            .value(moistureContent.get().replicatesList().get(0).dryWeight()))
        .andExpect(jsonPath("$.replicatesList[0].replicateAccInd")
            .value(moistureContent.get().replicatesList().get(0).replicateAccInd()))
        .andExpect(jsonPath("$.replicatesList[0].replicateComment")
            .value(moistureContent.get().replicatesList().get(0).replicateComment()))
        .andExpect(jsonPath("$.replicatesList[0].overrideReason")
            .value(moistureContent.get().replicatesList().get(0).overrideReason()))
        .andExpect(jsonPath("$.replicatesList[1].riaKey")
            .value(moistureContent.get().replicatesList().get(1).riaKey()))
        .andExpect(jsonPath("$.replicatesList[1].replicateNumber")
            .value(moistureContent.get().replicatesList().get(1).replicateNumber()))
        .andExpect(jsonPath("$.replicatesList[1].containerId")
            .value(moistureContent.get().replicatesList().get(1).containerId()))
        .andExpect(jsonPath("$.replicatesList[1].containerWeight")
            .value(moistureContent.get().replicatesList().get(1).containerWeight()))
        .andExpect(jsonPath("$.replicatesList[1].freshSeed")
            .value(moistureContent.get().replicatesList().get(1).freshSeed()))
        .andExpect(jsonPath("$.replicatesList[1].containerAndDryWeight")
            .value(moistureContent.get().replicatesList().get(1).containerAndDryWeight()))
        .andExpect(jsonPath("$.replicatesList[1].dryWeight")
            .value(moistureContent.get().replicatesList().get(1).dryWeight()))
        .andExpect(jsonPath("$.replicatesList[1].replicateAccInd")
            .value(moistureContent.get().replicatesList().get(1).replicateAccInd()))
        .andExpect(jsonPath("$.replicatesList[1].replicateComment")
            .value(moistureContent.get().replicatesList().get(1).replicateComment()))
        .andExpect(jsonPath("$.replicatesList[1].overrideReason")
            .value(moistureContent.get().replicatesList().get(1).overrideReason()))
        .andReturn();
  }

  @Test
  @DisplayName("Get a MCC endpoint should return empty for invalid values.")
  void getMccDataInvalidKeyShouldReturnEmpty() throws Exception {
    BigDecimal riaKey = new BigDecimal(1234567890);

    when(moistureContentService.getMoistureConeContentData(riaKey))
        .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));

    mockMvc
        .perform(
             get("/api/moisture-content-cone/{riaKey}", riaKey)
                 .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("Get a MCC should return not found for empty parameter")
  void getMccDataEmptyParameter() throws Exception {
    mockMvc
        .perform(get("/api/moisture-content-cone/").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }

  private static final BigDecimal RIA_KEY = new BigDecimal(1234567890);
  private static final LocalDateTime TS = LocalDateTime.parse("2013-08-01T00:00:00");

  private static ActivityFormDto activity(String comment, LocalDateTime updateTimestamp) {
    return new ActivityFormDto("STD", TS, TS, comment, updateTimestamp);
  }

  private ResultActions putAutosave(MccAutosaveFormDto dto) throws Exception {
    return mockMvc.perform(put("/api/moisture-content-cone/{riaKey}", RIA_KEY)
        .with(csrf().asHeader())
        .contentType(MediaType.APPLICATION_JSON)
        .accept(MediaType.APPLICATION_JSON)
        .content(mapper.writeValueAsString(dto)));
  }

  @Test
  @DisplayName("PUT autosave saves the activity and replicates and returns the activity")
  void autosave_shouldSucceed() throws Exception {
    MccAutosaveFormDto dto = new MccAutosaveFormDto(activity("New comment", TS), List.of(
        new MccReplicateFormDto(1, "A1", new BigDecimal("1.1"), new BigDecimal("2.2"),
        new BigDecimal("3.3"), new BigDecimal("1.1"), 1, null, null)));
    ActivityEntity saved = new ActivityEntity();
    saved.setRiaKey(RIA_KEY);
    saved.setRiaComment("New comment");
    saved.setUpdateTimestamp(LocalDateTime.parse("2013-08-02T00:00:00"));
    when(moistureContentService.autosave(RIA_KEY, dto)).thenReturn(saved);

    putAutosave(dto)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.riaComment").value("New comment"))
        .andExpect(jsonPath("$.updateTimestamp").value("2013-08-02T00:00:00"));
  }

  @Test
  @DisplayName("PUT autosave accepts a partial activity record (dates and category unset)")
  void autosave_partialRecord_isAccepted() throws Exception {
    MccAutosaveFormDto dto = new MccAutosaveFormDto(
        new ActivityFormDto(null, null, null, null, TS), List.of());
    when(moistureContentService.autosave(RIA_KEY, dto)).thenReturn(new ActivityEntity());

    putAutosave(dto).andExpect(status().isOk());
  }

  @Test
  @DisplayName("PUT autosave returns 409 on optimistic lock conflict")
  void autosave_conflict_returns409() throws Exception {
    doThrow(new ResponseStatusException(HttpStatus.CONFLICT,
            "Activity was modified by another user; reload and retry"))
        .when(moistureContentService).autosave(any(), any());

    putAutosave(new MccAutosaveFormDto(activity("c", TS), List.of()))
        .andExpect(status().isConflict());
  }

  @Test
  @DisplayName("PUT autosave returns 400 without the updateTimestamp it locks on")
  void autosave_missingTimestamp_returns400() throws Exception {
    putAutosave(new MccAutosaveFormDto(activity("c", null), List.of()))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("PUT autosave returns 400 when the comment exceeds the column")
  void autosave_commentTooLong_returns400() throws Exception {
    putAutosave(new MccAutosaveFormDto(activity("x".repeat(2001), TS), List.of()))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("PUT autosave returns 400 when a containerId is too long")
  void autosave_containerIdTooLong_returns400() throws Exception {
    MccAutosaveFormDto dto = new MccAutosaveFormDto(activity("ok", TS), List.of(
        new MccReplicateFormDto(1, "12345", null, null, null, null, 1, null, null)));

    putAutosave(dto).andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("PUT autosave returns 400 when a replicate has no replicateNumber")
  void autosave_missingReplicateNumber_returns400() throws Exception {
    putAutosave(new MccAutosaveFormDto(activity("c", TS), List.of(
        new MccReplicateFormDto(null, null, null, null, null, null, 0, null, null))))
        .andExpect(status().isBadRequest());
  }


  void validateMoistureContentData_Success() throws Exception {
    BigDecimal riaKey = BigDecimal.valueOf(123);
    MoistureContentConesDto dto = mock(MoistureContentConesDto.class);

    when(moistureContentService.getMoistureConeContentData(riaKey)).thenReturn(Optional.of(dto));
    when(dto.replicatesList()).thenReturn(null);
    when(dto.actualBeginDateTime()).thenReturn(null);
    when(dto.actualEndDateTime()).thenReturn(null);
    when(dto.testCategoryCode()).thenReturn(null);

    doNothing().when(moistureContentService).validateMoistureConeContentData(any());
    doNothing().when(activityService).validateActivityData(any());
    doNothing().when(testResultService).updateTestResultStatusToCompleted(riaKey);

    mockMvc
        .perform(post("/api/moisture-content-cone/validate/{riaKey}", riaKey)
            .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());
  }


  @Test
  void validateMoistureContentData_BadRequest() throws Exception {
    BigDecimal riaKey = BigDecimal.valueOf(123);

    when(moistureContentService.getMoistureConeContentData(riaKey))
        .thenThrow(new ResponseStatusException(
           org.springframework.http.HttpStatus.BAD_REQUEST,
           "Invalid request"));

    mockMvc.perform(get("/api/moisture-content-cone/validate/{riaKey}", riaKey)
                .contentType(MediaType.APPLICATION_JSON))
           .andExpect(status().isBadRequest());
  }

  @Test
  void acceptMoistureContentData_Success() throws Exception {
    BigDecimal riaKey = BigDecimal.valueOf(123);

    doNothing().when(testResultService).acceptTestResult(riaKey);

    mockMvc.perform(get("/api/moisture-content-cone/accept/{riaKey}", riaKey)
                .contentType(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk());
  }

  @Test
  void acceptMoistureContentData_BadRequest() throws Exception {
    BigDecimal riaKey = BigDecimal.valueOf(123);

    doThrow(new ResponseStatusException(
        org.springframework.http.HttpStatus.BAD_REQUEST,
        "Invalid request"))
      .when(testResultService).acceptTestResult(riaKey);

    mockMvc.perform(get("/api/moisture-content-cone/accept/{riaKey}", riaKey)
                .contentType(MediaType.APPLICATION_JSON))
           .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("Delete a replicate entry should succeed")
  void deleteReplicate_shouldSucceed() throws Exception {
    BigDecimal riaKey = new BigDecimal(1234567890);
    Integer replicateNumber = 1;
    MoistureContentConesDto mockDto = new MoistureContentConesDto(
        1, "Sample", "STATUS", new BigDecimal("50.0"), 1,
        "REQ123", "SL123", null, "A",
        "PLI","ACT", "TST", "Comment",
        LocalDateTime.now(), LocalDateTime.now(), LocalDateTime.now(), "MCM", Collections.emptyList()
    );

    // Mock service behavior
    when(moistureContentService.deleteMccReplicate(riaKey, replicateNumber))
        .thenReturn(Optional.of(mockDto));

    mockMvc.perform(delete("/api/moisture-content-cone/{riaKey}/{replicateNumber}", riaKey,
            replicateNumber).with(csrf().asHeader()).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());
  }

  @Test
  @DisplayName("Delete a replicate entry should return 404 when not found")
  void deleteReplicate_shouldReturnNotFound() throws Exception {
    BigDecimal riaKey = new BigDecimal(1234567890);
    Integer replicateNumber = 1;

    // Simulate resource not found scenario
    doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND)).when(moistureContentService)
        .deleteMccReplicate(riaKey, replicateNumber);

    mockMvc.perform(delete("/api/moisture-content-cone/{riaKey}/{replicateNumber}", riaKey,
            replicateNumber).with(csrf().asHeader()).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("POST /{riaKey}/replicates - should delete multiple replicates")
  void deleteReplicates_shouldSucceed() throws Exception {
    BigDecimal riaKey = new BigDecimal("1234567890");
    List<Integer> replicateNumbers = Arrays.asList(1, 2, 3);

    doNothing().when(moistureContentService).deleteMccReplicates(riaKey, replicateNumbers);

    mockMvc.perform(delete("/api/moisture-content-cone/{riaKey}/replicates", riaKey)
            .with(csrf().asHeader())
            .contentType(MediaType.APPLICATION_JSON)
            .param("ids", replicateNumbers.stream().map(String::valueOf).collect(Collectors.joining(","))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0]").value(1))
        .andExpect(jsonPath("$[1]").value(2))
        .andExpect(jsonPath("$[2]").value(3));
  }

  @Test
  @DisplayName("POST /{riaKey}/replicates - should return 404 when replicates not found")
  void deleteReplicates_shouldReturnNotFound() throws Exception {
    BigDecimal riaKey = new BigDecimal("1234567890");
    List<Integer> replicateNumbers = Arrays.asList(1, 2, 3);

    doThrow(new InvalidTestActivityKeyException())
        .when(moistureContentService).deleteMccReplicates(riaKey, replicateNumbers);

    mockMvc.perform(delete("/api/moisture-content-cone/{riaKey}/replicates", riaKey)
            .with(csrf().asHeader())
            .contentType(MediaType.APPLICATION_JSON)
            .param("ids", replicateNumbers.stream().map(String::valueOf).collect(Collectors.joining(","))))
        .andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("POST /{riaKey}/calculate-average - should calculate average successfully")
  void calculateAverage_shouldSucceed() throws Exception {
    BigDecimal riaKey = new BigDecimal("1234567890");
    List<Double> numbers = Arrays.asList(1.0, 2.0, 3.0, 4.0, 5.0);
    double expectedAverage = 3.0;

    when(moistureContentService.calculateAverage(riaKey, numbers)).thenReturn(expectedAverage);

    mockMvc.perform(post("/api/moisture-content-cone/{riaKey}/calculate-average", riaKey)
            .with(csrf().asHeader())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(numbers)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").value(expectedAverage));
  }

  @Test
  @DisplayName("POST /{riaKey}/calculate-average - should return 400 for null list")
  void calculateAverage_shouldReturnBadRequestForNullList() throws Exception {
    BigDecimal riaKey = new BigDecimal("1234567890");

    mockMvc.perform(post("/api/moisture-content-cone/{riaKey}/calculate-average", riaKey)
            .with(csrf().asHeader())
            .contentType(MediaType.APPLICATION_JSON)
            .content("null"))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("POST /{riaKey}/calculate-average - should return 500 for service error")
  void calculateAverage_shouldReturnInternalServerError() throws Exception {
    BigDecimal riaKey = new BigDecimal("1234567890");
    List<Double> numbers = Arrays.asList(1.0, 2.0, 3.0);

    when(moistureContentService.calculateAverage(riaKey, numbers))
        .thenThrow(new RuntimeException("Unexpected error"));

    mockMvc.perform(post("/api/moisture-content-cone/{riaKey}/calculate-average", riaKey)
            .with(csrf().asHeader())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(numbers)))
        .andExpect(status().isInternalServerError());
  }

  @Test
  @DisplayName("GET /validate/{riaKey} - should successfully validate data")
  void validateMoistureContentData_shouldSucceed() throws Exception {
    BigDecimal riaKey = new BigDecimal("1234567890");

    // Mock data
    MoistureContentConesDto mockDto = new MoistureContentConesDto(
        1, "Sample", "STATUS", new BigDecimal("50.0"), 1,
        "REQ123", "SL123", null, "A",
        "PLI","ACT", "TST", "Comment",
        LocalDateTime.now(), LocalDateTime.now(), LocalDateTime.now(), "MCM", Collections.emptyList()
    );

    when(moistureContentService.getMoistureConeContentData(riaKey))
        .thenReturn(Optional.of(mockDto));

    doNothing().when(moistureContentService)
        .validateMoistureConeContentData(anyList());

    doNothing().when(activityService)
        .validateActivityData(any(ActivityEntity.class));

    doNothing().when(testResultService)
        .updateTestResultStatusToCompleted(riaKey);

    mockMvc.perform(get("/api/moisture-content-cone/validate/{riaKey}", riaKey)
            .with(csrf().asHeader()))
        .andExpect(status().isOk());
  }

  @Test
  @DisplayName("GET /validate/{riaKey} - should return 400 when validation fails")
  void validateMoistureContentData_shouldReturnBadRequest() throws Exception {
    BigDecimal riaKey = new BigDecimal("1234567890");

    MoistureContentConesDto mockDto = new MoistureContentConesDto(
        1, "Sample", "STATUS", new BigDecimal("50.0"), 1,
        "REQ123", "SL123", null, "A",
        "PLI","ACT", "TST", "Comment",
        LocalDateTime.now(), LocalDateTime.now(), LocalDateTime.now(), "MCM", Collections.emptyList()
    );

    when(moistureContentService.getMoistureConeContentData(riaKey))
        .thenReturn(Optional.of(mockDto));

    doThrow(new IllegalArgumentException("Invalid moisture data"))
        .when(moistureContentService)
        .validateMoistureConeContentData(anyList());

    mockMvc.perform(get("/api/moisture-content-cone/validate/{riaKey}", riaKey)
            .with(csrf().asHeader()))
        .andExpect(status().isBadRequest())
        .andExpect(result -> assertTrue(
            result.getResolvedException() instanceof ResponseStatusException))
        .andExpect(result -> assertEquals(
            "400 BAD_REQUEST \"Invalid moisture data\"",
            result.getResolvedException().getMessage()));
  }

  @Test
  @DisplayName("GET /validate/{riaKey} - should return 400 when activity validation fails")
  void validateMoistureContentData_shouldReturnBadRequestForActivity() throws Exception {
    BigDecimal riaKey = new BigDecimal("1234567890");

    MoistureContentConesDto mockDto = new MoistureContentConesDto(
        1, "Sample", "STATUS", new BigDecimal("50.0"), 1,
        "REQ123", "SL123", null, "A",
        "PLI", "ACT", "TST", "Comment",
        LocalDateTime.now(), LocalDateTime.now(), LocalDateTime.now(), "MCM", Collections.emptyList()
    );

    when(moistureContentService.getMoistureConeContentData(riaKey))
        .thenReturn(Optional.of(mockDto));

    doNothing().when(moistureContentService)
        .validateMoistureConeContentData(anyList());

    doThrow(new IllegalArgumentException("Invalid activity data"))
        .when(activityService)
        .validateActivityData(any(ActivityEntity.class));

    mockMvc.perform(get("/api/moisture-content-cone/validate/{riaKey}", riaKey)
            .with(csrf().asHeader()))
        .andExpect(status().isBadRequest())
        .andExpect(result -> assertTrue(
            result.getResolvedException() instanceof ResponseStatusException))
        .andExpect(result -> assertEquals(
            "400 BAD_REQUEST \"Invalid activity data\"",
            result.getResolvedException().getMessage()));
  }
}
