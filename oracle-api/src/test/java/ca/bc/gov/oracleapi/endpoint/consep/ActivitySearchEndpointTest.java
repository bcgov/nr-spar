package ca.bc.gov.oracleapi.endpoint.consep;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.consep.ActivitySearchPageResponseDto;
import ca.bc.gov.oracleapi.dto.consep.ActivitySearchRequestDto;
import ca.bc.gov.oracleapi.dto.consep.ActivitySearchResponseDto;
import ca.bc.gov.oracleapi.dto.consep.TestCodeDto;
import ca.bc.gov.oracleapi.service.consep.ActivitySearchService;
import ca.bc.gov.oracleapi.service.consep.TestCodeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.Objects;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Pageable;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

@WebMvcTest(ActivitySearchEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_TSC_SUPERVISOR")
class ActivitySearchEndpointTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private ActivitySearchService activitySearchService;

  @MockBean
  private TestCodeService testCodeService;

  @Autowired
  private ObjectMapper objectMapper;


  @Test
  @DisplayName("POST /search - Should return 200 and data when request is valid")
  void searchTestingActivityData_shouldSucceed() throws Exception {
    ActivitySearchRequestDto requestDto = createDummyRequestDto();
    ActivitySearchResponseDto responseItem = createDummyResponseDto();
    ActivitySearchPageResponseDto pageResponse =
        new ActivitySearchPageResponseDto(List.of(responseItem), 1L, 1, 0, 20);

    when(activitySearchService.searchTestingActivities(any(), any(), any(), any())).thenReturn(
        pageResponse);

    mockMvc.perform(
            post("/api/testing-activities/search").with(csrf()).contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto))).andExpect(status().isOk())
        .andExpect(jsonPath("$.content", hasSize(1)))
        .andExpect(jsonPath("$.content[0].seedlotDisplay").value("00098"))
        .andExpect(jsonPath("$.content[0].requestItem").value("RTS19981299A"))
        .andExpect(jsonPath("$.totalElements").value(1));
  }

  @Test
  @DisplayName("POST /search - Should handle 'unpaged=true' by passing unpaged Pageable to service")
  void searchTestingActivityData_withUnpaged_shouldPassUnpagedToService() throws Exception {
    ActivitySearchRequestDto requestDto = createDummyRequestDto();

    when(activitySearchService.searchTestingActivities(any(), any(), any(), any())).thenReturn(
        new ActivitySearchPageResponseDto(Collections.emptyList(), 0L, 0, 0, 0));

    mockMvc.perform(post("/api/testing-activities/search").param("unpaged", "true").with(csrf())
            .contentType(APPLICATION_JSON).content(objectMapper.writeValueAsString(requestDto)))
        .andExpect(status().isOk());

    ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);

    verify(activitySearchService).searchTestingActivities(any(ActivitySearchRequestDto.class),
        pageableCaptor.capture(), any(), any());

    Pageable capturedPageable = pageableCaptor.getValue();
    assertThat(capturedPageable.isPaged()).isFalse();
  }

  @Test
  @DisplayName("POST /search - Should throw Exception when sortBy field is not allowed")
  void searchTestingActivityData_invalidSortField_shouldFail() throws Exception {
    ActivitySearchRequestDto requestDto = createDummyRequestDto();

    mockMvc.perform(post("/api/testing-activities/search")
        .param("sortBy", "INVALID_FIELD_SQL_INJECTION")
        .with(csrf())
        .contentType(APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(requestDto)))
        .andExpect(status().isBadRequest())
        .andExpect(result -> assertTrue(
            result.getResolvedException() instanceof ResponseStatusException))
        .andExpect(result -> assertTrue(
            Objects.requireNonNull(result.getResolvedException())
                .getMessage().contains("Invalid sort field")));
  }

  @Test
  void getTestTypeCodes_shouldReturnList() throws Exception {
    List<TestCodeDto> mockCodes = List.of(new TestCodeDto("TT1", "TEST type 1"));
    when(testCodeService.getTestTypeCodes()).thenReturn(mockCodes);

    mockMvc.perform(get("/api/testing-activities/type-codes").with(csrf()))
        .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].code").value("TT1"));
  }

  @Test
  void getTestCategoryCodes_shouldReturnList() throws Exception {
    List<TestCodeDto> mockCodes = List.of(new TestCodeDto("CAT1", "Category 1"));
    when(testCodeService.getTestCategoryCodes()).thenReturn(mockCodes);

    mockMvc.perform(get("/api/testing-activities/category-codes").with(csrf()))
        .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].code").value("CAT1"));
  }

  private ActivitySearchRequestDto createDummyRequestDto() {
    return new ActivitySearchRequestDto(List.of("00098"), "D1", "D1", null,
        LocalDate.of(1997, 10, 1), LocalDate.of(1998, 10, 31), false, true, "RTS19981299A", "RTS",
        1998, null, "STD", "A", "PLI", null, null, null, null, null, null, null, null, -1, -1, -1,
        "A");
  }

  private ActivitySearchResponseDto createDummyResponseDto() {
    return new ActivitySearchResponseDto("00098", "RTS19981299A", "PLI", "D1", "A", 0, "STD", 88,
        "77//9", 0, 0, 0, 0, -1, -1, -1, LocalDate.of(1997, 10, 7).atTime(LocalTime.MAX),
        LocalDate.of(1997, 10, 10).atTime(LocalTime.MAX), LocalDate.of(1998, 10, 8).atStartOfDay(),
        LocalDate.of(1998, 11, 6).atTime(LocalTime.MAX), "Comment", 44115, "RTS19981299", "A",
        "00098", 448383);
  }
}
