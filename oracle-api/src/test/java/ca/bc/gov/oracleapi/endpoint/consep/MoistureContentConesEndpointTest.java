package ca.bc.gov.oracleapi.endpoint.consep;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.consep.MoistureContentConesDto;
import ca.bc.gov.oracleapi.dto.consep.ReplicateDto;
import ca.bc.gov.oracleapi.service.consep.MoistureContentService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
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
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

@WebMvcTest(MoistureContentConesEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class MoistureContentConesEndpointTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private MoistureContentService moistureContentService;

  @InjectMocks
  private MoistureContentConesEndpoint moistureContentConesEndpoint;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    mockMvc = MockMvcBuilders.standaloneSetup(moistureContentConesEndpoint).build();
  }


  @Test
  @DisplayName("Get a MCC data for a seedlot should succeed")
  void getMccData_shouldSucceed() throws Exception {
    ReplicateDto replicate1 =
        new ReplicateDto(new BigDecimal(1234567890), 1, "A123", new BigDecimal(12.345),
            new BigDecimal(45.678), new BigDecimal(58.901), new BigDecimal(46.789), 1,
            "Replicate was re-tested due to abnormal moisture content.",
            "Equipment calibration issue.");
    ReplicateDto replicate2 =
        new ReplicateDto(new BigDecimal(1234567890), 2, "B456", new BigDecimal(12.345),
            new BigDecimal(45.678), new BigDecimal(58.901), new BigDecimal(46.789), 2,
            "Replicate passed all tests successfully.", "No issues.");
    List<ReplicateDto> replicatesList = List.of(replicate1, replicate2);
    Optional<MoistureContentConesDto> moistureContent = Optional.of(
        new MoistureContentConesDto(1, "Sample description", "MOI", new BigDecimal(12.345), 1,
            "TST", "Comment for this content", LocalDateTime.parse("2013-08-01T00:00:00"),
            LocalDateTime.parse("2013-08-01T00:00:00"), replicatesList));

    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    BigDecimal riaKey = new BigDecimal(1234567890);
    when(moistureContentService.getMoistureConeContentData(riaKey)).thenReturn(moistureContent);

    mockMvc.perform(get("/api/moisture-content-cone/{riaKey}", riaKey).with(csrf().asHeader())
            .header("Content-Type", "application/json").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.testCompleteInd").value(moistureContent.get().testCompleteInd()))
        .andExpect(jsonPath("$.sampleDesc").value(moistureContent.get().sampleDesc()))
        .andExpect(jsonPath("$.moistureStatus").value(moistureContent.get().moistureStatus()))
        .andExpect(jsonPath("$.moisturePct").value(moistureContent.get().moisturePct()))
        .andExpect(jsonPath("$.acceptResult").value(moistureContent.get().acceptResult()))
        .andExpect(jsonPath("$.testCategoryCode").value(moistureContent.get().testCategoryCode()))
        .andExpect(jsonPath("$.riaComment").value(moistureContent.get().riaComment())).andExpect(
            jsonPath("$.actualBeginDateTime").value(
                moistureContent.get().actualBeginDateTime().format(formatter))).andExpect(
            jsonPath("$.actualEndDateTime").value(
                moistureContent.get().actualEndDateTime().format(formatter))).andExpect(
            jsonPath("$.replicatesList[0].riaKey").value(
                moistureContent.get().replicatesList().get(0).riaKey())).andExpect(
            jsonPath("$.replicatesList[0].replicateNumber").value(
                moistureContent.get().replicatesList().get(0).replicateNumber())).andExpect(
            jsonPath("$.replicatesList[0].containerId").value(
                moistureContent.get().replicatesList().get(0).containerId())).andExpect(
            jsonPath("$.replicatesList[0].containerWeight").value(
                moistureContent.get().replicatesList().get(0).containerWeight())).andExpect(
            jsonPath("$.replicatesList[0].freshSeed").value(
                moistureContent.get().replicatesList().get(0).freshSeed())).andExpect(
            jsonPath("$.replicatesList[0].containerAndDryWeight").value(
                moistureContent.get().replicatesList().get(0).containerAndDryWeight())).andExpect(
            jsonPath("$.replicatesList[0].dryWeight").value(
                moistureContent.get().replicatesList().get(0).dryWeight())).andExpect(
            jsonPath("$.replicatesList[0].replicateAccInd").value(
                moistureContent.get().replicatesList().get(0).replicateAccInd())).andExpect(
            jsonPath("$.replicatesList[0].replicateComment").value(
                moistureContent.get().replicatesList().get(0).replicateComment())).andExpect(
            jsonPath("$.replicatesList[0].overrideReason").value(
                moistureContent.get().replicatesList().get(0).overrideReason())).andExpect(
            jsonPath("$.replicatesList[1].riaKey").value(
                moistureContent.get().replicatesList().get(1).riaKey())).andExpect(
            jsonPath("$.replicatesList[1].replicateNumber").value(
                moistureContent.get().replicatesList().get(1).replicateNumber())).andExpect(
            jsonPath("$.replicatesList[1].containerId").value(
                moistureContent.get().replicatesList().get(1).containerId())).andExpect(
            jsonPath("$.replicatesList[1].containerWeight").value(
                moistureContent.get().replicatesList().get(1).containerWeight())).andExpect(
            jsonPath("$.replicatesList[1].freshSeed").value(
                moistureContent.get().replicatesList().get(1).freshSeed())).andExpect(
            jsonPath("$.replicatesList[1].containerAndDryWeight").value(
                moistureContent.get().replicatesList().get(1).containerAndDryWeight())).andExpect(
            jsonPath("$.replicatesList[1].dryWeight").value(
                moistureContent.get().replicatesList().get(1).dryWeight())).andExpect(
            jsonPath("$.replicatesList[1].replicateAccInd").value(
                moistureContent.get().replicatesList().get(1).replicateAccInd())).andExpect(
            jsonPath("$.replicatesList[1].replicateComment").value(
                moistureContent.get().replicatesList().get(1).replicateComment())).andExpect(
            jsonPath("$.replicatesList[1].overrideReason").value(
                moistureContent.get().replicatesList().get(1).overrideReason())).andReturn();
  }

  @Test
  @DisplayName("Get a MCC endpoint should return empty for invalid values.")
  void getMccDataInvalidKeyShouldReturnEmpty() throws Exception {
    BigDecimal riaKey = new BigDecimal(1234567890);

    when(moistureContentService.getMoistureConeContentData(riaKey)).thenThrow(
        new ResponseStatusException(HttpStatus.NOT_FOUND));

    mockMvc.perform(
        get("/api/moisture-content-cone/{riaKey}", riaKey)
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("Get a MCC should return not found for empty parameter")
  void getMccDataEmptyParameter() throws Exception {
    mockMvc.perform(get("/api/moisture-content-cone/").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }

  @Test
  void validateMoistureContentData_Success() throws Exception {
    BigDecimal riaKey = BigDecimal.valueOf(123);
    MoistureContentConesDto dto = mock(MoistureContentConesDto.class);

    when(moistureContentService.getMoistureConeContentData(riaKey)).thenReturn(Optional.of(dto));
    when(dto.replicatesList()).thenReturn(null);
    when(dto.actualBeginDateTime()).thenReturn(null);
    when(dto.actualEndDateTime()).thenReturn(null);
    when(dto.testCategoryCode()).thenReturn(null);

    doNothing().when(moistureContentService).validateMoistureConeContentData(any());
    doNothing().when(moistureContentService).validateMoistureContentActivityData(any());
    doNothing().when(moistureContentService).updateTestResultStatusToCompleted(riaKey);

    mockMvc.perform(post("/api/moisture-content-cone/{riaKey}/validate", riaKey).contentType(
        MediaType.APPLICATION_JSON)).andExpect(status().isOk());
  }


  @Test
  void validateMoistureContentData_BadRequest() throws Exception {
    BigDecimal riaKey = BigDecimal.valueOf(123);

    when(moistureContentService.getMoistureConeContentData(riaKey)).thenThrow(
        new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
            "Invalid request"));

    mockMvc.perform(post("/api/moisture-content-cone/{riaKey}/validate", riaKey).contentType(
        MediaType.APPLICATION_JSON)).andExpect(status().isBadRequest());
  }

  @Test
  void acceptMoistureContentData_Success() throws Exception {
    BigDecimal riaKey = BigDecimal.valueOf(123);

    doNothing().when(moistureContentService).acceptMoistureContentData(riaKey);

    mockMvc.perform(post("/api/moisture-content-cone/{riaKey}/accept", riaKey).contentType(
        MediaType.APPLICATION_JSON)).andExpect(status().isOk());
  }

  @Test
  void acceptMoistureContentData_BadRequest() throws Exception {
    BigDecimal riaKey = BigDecimal.valueOf(123);

    doThrow(new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
        "Invalid request")).when(moistureContentService).acceptMoistureContentData(riaKey);

    mockMvc.perform(post("/api/moisture-content-cone/{riaKey}/accept", riaKey).contentType(
        MediaType.APPLICATION_JSON)).andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("Delete MCC data should succeed")
  void deleteMcc_shouldSucceed() throws Exception {
    BigDecimal riaKey = new BigDecimal(1234567890);

    // Mock the service to do nothing when delete is called
    doNothing().when(moistureContentService).deleteFullMcc(riaKey);

    mockMvc.perform(delete("/api/moisture-content-cone/{riaKey}", riaKey).with(csrf().asHeader())
        .contentType(MediaType.APPLICATION_JSON)).andExpect(status().isOk());
  }

  @Test
  @DisplayName("Delete MCC data should return 404 when not found")
  void deleteMcc_shouldReturnNotFound() throws Exception {
    BigDecimal riaKey = new BigDecimal(1234567890);

    // Simulate resource not found scenario
    doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND)).when(moistureContentService)
        .deleteFullMcc(riaKey);

    mockMvc.perform(delete("/api/moisture-content-cone/{riaKey}", riaKey).with(csrf().asHeader())
        .contentType(MediaType.APPLICATION_JSON)).andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("Delete a replicate entry should succeed")
  void deleteReplicate_shouldSucceed() throws Exception {
    BigDecimal riaKey = new BigDecimal(1234567890);
    Integer replicateNumber = 1;

    // Mock service behavior
    doNothing().when(moistureContentService).deleteMccReplicate(riaKey, replicateNumber);

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
}
