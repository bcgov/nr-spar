package ca.bc.gov.oracleapi.endpoint.consep;

import static org.mockito.Mockito.*;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import ca.bc.gov.oracleapi.dto.consep.ActivityCreateDto;
import ca.bc.gov.oracleapi.entity.consep.ActivityEntity;
import ca.bc.gov.oracleapi.service.consep.ActivityService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
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
        new BigDecimal("408623"),
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
        1,
        null,
        1,
        1,
        new BigDecimal("33874"),
        "CSP19970005",
        "A",
        "PLI",
        "00098",
        ""
    );

    createdActivityEntity = new ActivityEntity();
    createdActivityEntity.setRiaKey(validActivityCreateDto.riaKey());
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
        .andExpect(jsonPath("$.riaKey").value(validActivityCreateDto.riaKey().toString()))
        .andExpect(jsonPath("$.requestId").value(validActivityCreateDto.requestId()))
        .andExpect(jsonPath("$.seedlotNumber").value(validActivityCreateDto.seedlotNumber()))
        .andExpect(jsonPath("$.requestSkey").value(validActivityCreateDto.requestSkey().toString()))
        .andExpect(jsonPath("$.itemId").value(validActivityCreateDto.itemId()));

    verify(activityService, times(1)).createActivity(validActivityCreateDto);
  }
}
