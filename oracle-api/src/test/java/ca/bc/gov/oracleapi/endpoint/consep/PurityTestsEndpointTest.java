package ca.bc.gov.oracleapi.endpoint.consep;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.consep.ActivityFormDto;
import ca.bc.gov.oracleapi.dto.consep.PurityReplicateDto;
import ca.bc.gov.oracleapi.dto.consep.PurityReplicateFormDto;
import ca.bc.gov.oracleapi.dto.consep.PurityTestDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.entity.consep.PurityReplicateEntity;
import ca.bc.gov.oracleapi.entity.consep.idclass.ReplicateId;
import ca.bc.gov.oracleapi.service.consep.ActivityService;
import ca.bc.gov.oracleapi.service.consep.PurityTestService;
import ca.bc.gov.oracleapi.service.consep.TestResultService;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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

@WebMvcTest(PurityTestsEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class PurityTestsEndpointTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private PurityTestService purityTestService;

  @MockBean
  private ActivityService activityService;

  @MockBean
  private TestResultService testResultService;

  @InjectMocks
  private PurityTestsEndpoint purityTestsEndpoint;

  @Autowired
  private ObjectMapper objectMapper;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    mockMvc = MockMvcBuilders.standaloneSetup(purityTestsEndpoint).build();
  }

  private final ObjectMapper mapper = new ObjectMapper()
        .registerModule(new JavaTimeModule())
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

  @Test
  @DisplayName("Get purity data for a ria key should succeed")
  void getPurityData_shouldSucceed() throws Exception {
    PurityReplicateDto replicate1 = new PurityReplicateDto(
        new BigDecimal(1234567890),
        1,
        new BigDecimal(12.345),
        new BigDecimal(45.678),
        new BigDecimal(58.901),
        0,
        "Equipment calibration issue."
    );
    PurityReplicateDto replicate2 = new PurityReplicateDto(
        new BigDecimal(1234567890),
        2,
        new BigDecimal(12.345),
        new BigDecimal(45.678),
        new BigDecimal(58.901),
        1,
        "Divergent weights."
    );
    List<PurityReplicateDto> replicatesList = List.of(replicate1, replicate2);
    Optional<PurityTestDto> purityContent = Optional.of(
        new PurityTestDto(
            1,
            "Sample description",
            "MOI",
            new BigDecimal(12.345),
            1,
            "ABC123456",
            "60000",
            "PUR",
            "TST",
            "Comment for this test",
            LocalDateTime.parse("2013-08-01T00:00:00"),
            LocalDateTime.parse("2013-08-01T00:00:00"),
            replicatesList
        ));

    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    BigDecimal riaKey = new BigDecimal(1234567890);
    when(purityTestService.getPurityTestData(riaKey)).thenReturn(purityContent);

    mockMvc
        .perform(
            get("/api/purity-tests/{riaKey}", riaKey)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.testCompleteInd").value(purityContent.get().testCompleteInd()))
        .andExpect(jsonPath("$.sampleDesc").value(purityContent.get().sampleDesc()))
        .andExpect(jsonPath("$.moistureStatus").value(purityContent.get().moistureStatus()))
        .andExpect(jsonPath("$.moisturePct").value(purityContent.get().moisturePct()))
        .andExpect(jsonPath("$.acceptResult").value(purityContent.get().acceptResult()))
        .andExpect(jsonPath("$.requestId").value(purityContent.get().requestId()))
        .andExpect(jsonPath("$.seedlotNumber").value(purityContent.get().seedlotNumber()))
        .andExpect(jsonPath("$.activityType").value(purityContent.get().activityType()))
        .andExpect(jsonPath("$.testCategoryCode").value(purityContent.get().testCategoryCode()))
        .andExpect(jsonPath("$.riaComment").value(purityContent.get().riaComment()))
        .andExpect(jsonPath("$.actualBeginDateTime")
            .value(purityContent.get().actualBeginDateTime().format(formatter)))
        .andExpect(jsonPath("$.actualEndDateTime")
            .value(purityContent.get().actualEndDateTime().format(formatter)))
        .andExpect(jsonPath("$.replicatesList[0].riaKey")
            .value(purityContent.get().replicatesList().get(0).riaKey()))
        .andExpect(jsonPath("$.replicatesList[0].replicateNumber")
            .value(purityContent.get().replicatesList().get(0).replicateNumber()))
        .andExpect(jsonPath("$.replicatesList[0].pureSeedWeight")
            .value(purityContent.get().replicatesList().get(0).pureSeedWeight()))
        .andExpect(jsonPath("$.replicatesList[0].otherSeedWeight")
            .value(purityContent.get().replicatesList().get(0).otherSeedWeight()))
        .andExpect(jsonPath("$.replicatesList[0].containerWeight")
            .value(purityContent.get().replicatesList().get(0).containerWeight()))
        .andExpect(jsonPath("$.replicatesList[0].replicateAccInd")
            .value(purityContent.get().replicatesList().get(0).replicateAccInd()))
        .andExpect(jsonPath("$.replicatesList[0].overrideReason")
            .value(purityContent.get().replicatesList().get(0).overrideReason()))
        .andExpect(jsonPath("$.replicatesList[1].riaKey")
            .value(purityContent.get().replicatesList().get(1).riaKey()))
        .andExpect(jsonPath("$.replicatesList[1].replicateNumber")
            .value(purityContent.get().replicatesList().get(1).replicateNumber()))
        .andExpect(jsonPath("$.replicatesList[1].pureSeedWeight")
            .value(purityContent.get().replicatesList().get(1).pureSeedWeight()))
        .andExpect(jsonPath("$.replicatesList[1].otherSeedWeight")
            .value(purityContent.get().replicatesList().get(1).otherSeedWeight()))
        .andExpect(jsonPath("$.replicatesList[1].containerWeight")
            .value(purityContent.get().replicatesList().get(1).containerWeight()))
        .andExpect(jsonPath("$.replicatesList[1].replicateAccInd")
            .value(purityContent.get().replicatesList().get(1).replicateAccInd()))
        .andExpect(jsonPath("$.replicatesList[1].overrideReason")
            .value(purityContent.get().replicatesList().get(1).overrideReason()))
        .andReturn();
  }

  @Test
  @DisplayName("Purity 'get' endpoint should return empty for invalid values.")
  void getPurityDataInvalidKeyShouldReturnEmpty() throws Exception {
    BigDecimal riaKey = new BigDecimal(1234567890);

    when(purityTestService.getPurityTestData(riaKey))
        .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));

    mockMvc
        .perform(
             get("/api/purity-tests/{riaKey}", riaKey)
                 .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("Purity 'get' endpoint should return not found for empty parameter")
  void getPurityDataEmptyParameter() throws Exception {
    mockMvc
        .perform(get("/api/purity-tests/").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("Update Purity - Activity data should succeed")
  void updatePurityActivity_shouldSucceed() throws Exception {
    BigDecimal riaKey = new BigDecimal(1234567890);

    ActivityFormDto activityFormDto = new ActivityFormDto(
        "STD",
        LocalDateTime.parse("2013-08-01T00:00:00"),
        LocalDateTime.parse("2013-08-01T00:00:00"),
        "New comment"
    );

    ActivityEntity activityEntity = new ActivityEntity();

    activityEntity.setRiaKey(riaKey);
    activityEntity.setActualBeginDateTime(activityFormDto.actualBeginDateTime());
    activityEntity.setActualEndDateTime(activityFormDto.actualEndDateTime());
    activityEntity.setTestCategoryCode(activityFormDto.testCategoryCode());
    activityEntity.setRiaComment(activityFormDto.riaComment());

    when(activityService.updateActivityField(riaKey, activityFormDto))
        .thenReturn(activityEntity);

    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    mockMvc
        .perform(patch("/api/purity-tests/{riaKey}", riaKey)
            .with(csrf().asHeader())
            .header("Content-Type", "application/json")
            .accept(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(activityFormDto)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.actualBeginDateTime")
            .value(activityFormDto.actualBeginDateTime().format(formatter)))
        .andExpect(jsonPath("$.actualEndDateTime")
            .value(activityFormDto.actualEndDateTime().format(formatter)))
        .andExpect(jsonPath("$.testCategoryCode").value(activityFormDto.testCategoryCode()))
        .andExpect(jsonPath("$.riaComment").value(activityFormDto.riaComment()));
  }

  @Test
  @DisplayName("Update Purity - Activity data should return 404 when activity not found")
  void updatePurityActivity_shouldReturnNotFound() throws Exception {
    BigDecimal riaKey = new BigDecimal(1234567890);
    ActivityFormDto activityFormDto = new ActivityFormDto(
        "TST",
        LocalDateTime.parse("2013-08-01T00:00:00"),
        LocalDateTime.parse("2013-08-01T00:00:00"),
        "Not found comment"
    );

    doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Activity entry not found"))
        .when(activityService).updateActivityField(riaKey, activityFormDto);

    mockMvc
        .perform(patch("/api/purity-tests/{riaKey}", riaKey)
            .with(csrf().asHeader())
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(activityFormDto)))
        .andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("Update Purity - Activity data should return 400 for invalid values")
  void updatePurityActivity_shouldReturnInvalid() throws Exception {
    BigDecimal riaKey = new BigDecimal(1234567890);
    ActivityFormDto activityFormDto = new ActivityFormDto(
        null,
        null,
        null,
        null
    );

    mockMvc
        .perform(patch("/api/purity-tests/{riaKey}", riaKey)
            .with(csrf().asHeader())
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(activityFormDto)))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("PATCH /replicate/{riaKey} - should update multiple replicate entities")
  @WithMockUser
  void updateReplicateField_shouldReturnUpdatedReplicates() throws Exception {
    BigDecimal riaKey = new BigDecimal("1234567890");

    PurityReplicateFormDto form1 = new PurityReplicateFormDto(
        1, new BigDecimal("1.1"), new BigDecimal("2.2"),
        new BigDecimal("3.3"), 0, "Override 1"
    );
    PurityReplicateFormDto form2 = new PurityReplicateFormDto(
        2, new BigDecimal("5.5"), new BigDecimal("6.6"),
        new BigDecimal("7.7"), 1, "Override 2"
    );

    PurityReplicateEntity entity1 = new PurityReplicateEntity();
    entity1.setId(new ReplicateId(riaKey, 1));
    entity1.setPureSeedWeight(form1.pureSeedWeight());
    entity1.setOtherSeedWeight(form1.otherSeedWeight());
    entity1.setContainerWeight(form1.containerWeight());
    entity1.setReplicateAccInd(form1.replicateAccInd());
    entity1.setOverrideReason(form1.overrideReason());

    PurityReplicateEntity entity2 = new PurityReplicateEntity();
    entity2.setId(new ReplicateId(riaKey, 2));
    entity2.setPureSeedWeight(form2.pureSeedWeight());
    entity2.setOtherSeedWeight(form2.otherSeedWeight());
    entity2.setContainerWeight(form2.containerWeight());
    entity2.setReplicateAccInd(form2.replicateAccInd());
    entity2.setOverrideReason(form2.overrideReason());


    List<PurityReplicateFormDto> formList = List.of(form1, form2);
    List<PurityReplicateEntity> entityList = List.of(entity1, entity2);

    when(purityTestService.updateReplicateField(eq(riaKey), eq(formList)))
        .thenReturn(entityList);

    mockMvc.perform(patch("/api/purity-tests/replicate/{riaKey}", riaKey)
            .with(csrf().asHeader())
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(formList)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].pureSeedWeight").value(form1.pureSeedWeight()))
        .andExpect(jsonPath("$[0].otherSeedWeight").value(form1.otherSeedWeight()))
        .andExpect(jsonPath("$[0].containerWeight").value(form1.containerWeight()))
        .andExpect(jsonPath("$[0].replicateAccInd").value(form1.replicateAccInd()))
        .andExpect(jsonPath("$[0].overrideReason").value(form1.overrideReason()))

        .andExpect(jsonPath("$[1].pureSeedWeight").value(form2.pureSeedWeight()))
        .andExpect(jsonPath("$[1].otherSeedWeight").value(form2.otherSeedWeight()))
        .andExpect(jsonPath("$[1].containerWeight").value(form2.containerWeight()))
        .andExpect(jsonPath("$[1].replicateAccInd").value(form2.replicateAccInd()))
        .andExpect(jsonPath("$[1].overrideReason").value(form2.overrideReason()));
  }

  @Test
  @DisplayName("PATCH /replicate/{riaKey} - should return 400 for invalid request body")
  @WithMockUser
  void updateReplicateField_shouldReturn400WhenInvalidRequest() throws Exception {
    BigDecimal riaKey = new BigDecimal("1234567890");

    PurityReplicateFormDto invalidForm = new PurityReplicateFormDto(
        null, new BigDecimal("1.1"), new BigDecimal("2.2"),
        new BigDecimal("3.3"), 0, null
    );

    mockMvc.perform(patch("/api/purity-tests/replicate/{riaKey}", riaKey)
            .with(csrf().asHeader())
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(List.of(invalidForm))))
        .andExpect(status().isBadRequest());
  }

  void validatePurityTestData_Success() throws Exception {
    BigDecimal riaKey = BigDecimal.valueOf(123);
    PurityTestDto dto = mock(PurityTestDto.class);

    when(purityTestService.getPurityTestData(riaKey)).thenReturn(Optional.of(dto));
    when(dto.replicatesList()).thenReturn(null);
    when(dto.actualBeginDateTime()).thenReturn(null);
    when(dto.actualEndDateTime()).thenReturn(null);
    when(dto.testCategoryCode()).thenReturn(null);

    doNothing().when(purityTestService).validatePurityReplicateData(any());
    doNothing().when(activityService).validateActivityData(any());
    doNothing().when(testResultService).updateTestResultStatusToCompleted(riaKey);

    mockMvc
        .perform(post("/api/purity-tests/validate/{riaKey}", riaKey)
            .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());
  }


  @Test
  void validatePurityData_BadRequest() throws Exception {
    BigDecimal riaKey = BigDecimal.valueOf(123);

    when(purityTestService.getPurityTestData(riaKey))
        .thenThrow(new ResponseStatusException(
           org.springframework.http.HttpStatus.BAD_REQUEST,
           "Invalid request"));

    mockMvc.perform(get("/api/purity-tests/validate/{riaKey}", riaKey)
                .contentType(MediaType.APPLICATION_JSON))
           .andExpect(status().isBadRequest());
  }

  @Test
  void acceptPurityData_Success() throws Exception {
    BigDecimal riaKey = BigDecimal.valueOf(123);

    doNothing().when(testResultService).acceptTestResult(riaKey);

    mockMvc.perform(get("/api/purity-tests/accept/{riaKey}", riaKey)
                .contentType(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk());
  }

  @Test
  void acceptPurityData_BadRequest() throws Exception {
    BigDecimal riaKey = BigDecimal.valueOf(123);

    doThrow(new ResponseStatusException(
        org.springframework.http.HttpStatus.BAD_REQUEST,
        "Invalid request"))
      .when(testResultService).acceptTestResult(riaKey);

    mockMvc.perform(get("/api/purity-tests/accept/{riaKey}", riaKey)
                .contentType(MediaType.APPLICATION_JSON))
           .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("Delete purity data should succeed")
  void deletePurity_shouldSucceed() throws Exception {
    BigDecimal riaKey = new BigDecimal(1234567890);

    // Mock the service to do nothing when delete is called
    doNothing().when(purityTestService).deleteFullPurityTest(riaKey);

    mockMvc.perform(delete("/api/purity-tests/{riaKey}", riaKey).with(csrf().asHeader())
        .contentType(MediaType.APPLICATION_JSON)).andExpect(status().isOk());
  }

  @Test
  @DisplayName("Delete purity data should return 404 when not found")
  void deletePurity_shouldReturnNotFound() throws Exception {
    BigDecimal riaKey = new BigDecimal(1234567890);

    // Simulate resource not found scenario
    doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND)).when(purityTestService)
        .deleteFullPurityTest(riaKey);

    mockMvc.perform(delete("/api/purity-tests/{riaKey}", riaKey).with(csrf().asHeader())
        .contentType(MediaType.APPLICATION_JSON)).andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("Delete a replicate entry should succeed")
  void deleteReplicate_shouldSucceed() throws Exception {
    BigDecimal riaKey = new BigDecimal(1234567890);
    Integer replicateNumber = 1;

    // Mock service behavior
    doNothing().when(purityTestService).deleteSinglePurityReplicate(riaKey, replicateNumber);

    mockMvc.perform(delete("/api/purity-tests/{riaKey}/{replicateNumber}", riaKey,
            replicateNumber).with(csrf().asHeader()).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());
  }

  @Test
  @DisplayName("Delete a replicate entry should return 404 when not found")
  void deleteReplicate_shouldReturnNotFound() throws Exception {
    BigDecimal riaKey = new BigDecimal(1234567890);
    Integer replicateNumber = 1;

    // Simulate resource not found scenario
    doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND)).when(purityTestService)
        .deleteSinglePurityReplicate(riaKey, replicateNumber);

    mockMvc.perform(delete("/api/purity-tests/{riaKey}/{replicateNumber}", riaKey,
            replicateNumber).with(csrf().asHeader()).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }
}
