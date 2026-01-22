package ca.bc.gov.oracleapi.endpoint.consep;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import ca.bc.gov.oracleapi.dto.consep.ActivityCreateDto;
import ca.bc.gov.oracleapi.dto.consep.ActivityRequestItemDto;
import ca.bc.gov.oracleapi.dto.consep.StandardActivityDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.service.consep.ActivityService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ActivityEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_TSC_SUPERVISOR")
class ActivityEndpointTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private ActivityService activityService;

  @Autowired
  private ObjectMapper objectMapper;

  private ActivityCreateDto validActivityCreateDto;
  private ActivityEntity createdActivityEntity;

  @BeforeEach
  void setUp() {
    validActivityCreateDto = new ActivityCreateDto(
        "ST1",
        "AC1",
        "TC1",
        new BigDecimal("33874"),
        LocalDate.of(2024, 1, 1),
        LocalDate.of(2024, 1, 2),
        null,
        null,
        1,
        "HR",
        0,
        -1,
        0,
        0,
        new BigDecimal("33874"),
        "CSP19970005",
        "A",
        "PLI",
        "00098",
        ""
    );

    createdActivityEntity = new ActivityEntity();
    createdActivityEntity.setRequestId(validActivityCreateDto.requestId());
    createdActivityEntity.setSeedlotNumber(validActivityCreateDto.seedlotNumber());
    createdActivityEntity.setRequestSkey(validActivityCreateDto.requestSkey());
    createdActivityEntity.setItemId(validActivityCreateDto.itemId());
  }

  @Test
  void createTestingActivity_shouldReturnCreated_andCallService() throws Exception {
    when(activityService.createActivity(any(ActivityCreateDto.class)))
        .thenReturn(createdActivityEntity);

    mockMvc.perform(post("/api/activities")
            .with(csrf())
            .contentType(APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(validActivityCreateDto)))
        .andExpect(status().isCreated())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.requestId").value(validActivityCreateDto.requestId()))
        .andExpect(jsonPath("$.seedlotNumber").value(validActivityCreateDto.seedlotNumber()))
        .andExpect(jsonPath("$.requestSkey").value(validActivityCreateDto.requestSkey().toString()))
        .andExpect(jsonPath("$.itemId").value(validActivityCreateDto.itemId()));

    verify(activityService, times(1)).createActivity(validActivityCreateDto);
  }

  @Test
  void createTestingActivity_shouldReturnBadRequest_whenInvalidDto() throws Exception {
    var invalidDto = new ActivityCreateDto(
        "", // standardActivityId cannot be empty
        validActivityCreateDto.activityTypeCd(),
        "TEST", // testCategoryCd can have max 3 chars
        validActivityCreateDto.associatedRiaKey(),
        null, // plannedStartDate cannot be null
        null, // plannedEndDate cannot be null
        validActivityCreateDto.revisedStartDate(),
        validActivityCreateDto.revisedEndDate(),
        null, // activityDuration cannot be null
        "", // activityTimeUnit cannot be empty
        validActivityCreateDto.significantStatusIndicator(),
        1, // indicators can only be 0 or -1
        validActivityCreateDto.processResultIndicator(),
        validActivityCreateDto.testResultIndicator(),
        null, // requestSkey cannot be null
        null, // requestId cannot be null
        null, // itemId cannot be null
        null, // vegetationState cannot be null
        validActivityCreateDto.seedlotNumber(),
        validActivityCreateDto.familyLotNumber()
    );

    mockMvc.perform(post("/api/activities")
            .with(csrf())
            .contentType(APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(invalidDto)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.fields[?(@.fieldName=='standardActivityId')].fieldMessage")
            .value("must not be blank"))
        .andExpect(jsonPath("$.fields[?(@.fieldName=='activityTimeUnit')].fieldMessage")
            .value("must not be blank"))
        .andExpect(jsonPath("$.fields[?(@.fieldName=='requestId')].fieldMessage")
            .value("must not be blank"))
        .andExpect(jsonPath("$.fields[?(@.fieldName=='plannedStartDate')].fieldMessage")
            .value("must not be null"))
        .andExpect(jsonPath("$.fields[?(@.fieldName=='plannedEndDate')].fieldMessage")
            .value("must not be null"))
        .andExpect(jsonPath("$.fields[?(@.fieldName=='activityDuration')].fieldMessage")
            .value("must not be null"))
        .andExpect(jsonPath("$.fields[?(@.fieldName=='itemId')].fieldMessage")
            .value("must not be blank"))
        .andExpect(jsonPath("$.fields[?(@.fieldName=='vegetationState')].fieldMessage")
            .value("must not be blank"))
        .andExpect(jsonPath("$.fields[?(@.fieldName=='requestSkey')].fieldMessage")
            .value("must not be null"))
        .andExpect(jsonPath("$.fields[?(@.fieldName=='testCategoryCd')].fieldMessage")
            .value("size must be between 0 and 3"))
        .andExpect(jsonPath("$.fields[?(@.fieldName=='processCommitIndicator')].fieldMessage")
            .value("must be less than or equal to 0"));
  }

  @Test
  void getActivityByRequestSkeyAndItemId_shouldReturnDtoList() throws Exception {
    BigDecimal requestSkey = new BigDecimal("422679");
    String itemId = "A";
    var activities = List.of(
        new ActivityRequestItemDto(new BigDecimal("809210"), "G11 germination test"),
        new ActivityRequestItemDto(new BigDecimal("805643"), "Extend strat 35 days")
    );
    when(activityService.getActivityByRequestSkeyAndItemId(requestSkey, itemId)).thenReturn(activities);

    mockMvc.perform(
        get("/api/activities/request/{requestSkey}/item/{itemId}", requestSkey, itemId)
            .with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$[0].riaSkey").value("809210"))
        .andExpect(jsonPath("$[0].activityDescription").value("G11 germination test"))
        .andExpect(jsonPath("$[1].riaSkey").value("805643"))
        .andExpect(jsonPath("$[1].activityDescription").value("Extend strat 35 days"));

    verify(activityService, times(1)).getActivityByRequestSkeyAndItemId(requestSkey, itemId);
  }

  @Test
  void getStandardActivityIds_shouldReturnActivityDtoList() throws Exception {
    var dto1 = new StandardActivityDto("AEX", "Abies extraction");
    var dto2 = new StandardActivityDto("SSP", "Seed separation");
    var dto3 = new StandardActivityDto("TQA", "Tumbling qa");

    when(activityService.getStandardActivityIds())
        .thenReturn(List.of(dto1, dto2, dto3));

    mockMvc.perform(get("/api/activities/ids")
            .with(csrf()))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$", hasSize(3)))
        .andExpect(jsonPath("$[0].standardActivityId").value("AEX"))
        .andExpect(jsonPath("$[0].activityDescription").value("Abies extraction"))
        .andExpect(jsonPath("$[1].standardActivityId").value("SSP"))
        .andExpect(jsonPath("$[1].activityDescription").value("Seed separation"))
        .andExpect(jsonPath("$[2].standardActivityId").value("TQA"))
        .andExpect(jsonPath("$[2].activityDescription").value("Tumbling qa"));

    verify(activityService, times(1)).getStandardActivityIds();
  }
}
