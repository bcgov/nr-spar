package ca.bc.gov.oracleapi.endpoint.consep;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.consep.ActivitySearchResponseDto;
import ca.bc.gov.oracleapi.search.InvalidSearchException;
import ca.bc.gov.oracleapi.search.PageResponse;
import ca.bc.gov.oracleapi.search.PageResponse.PageMeta;
import ca.bc.gov.oracleapi.service.consep.ActivitySearchService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ActivitySearchEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_TSC_SUPERVISOR")
class ActivitySearchEndpointTest {

  private static final String SEARCH = "/api/testing-activities/search";
  private static final String MISSING = "/api/testing-activities/missing-lot-numbers";

  private static final String BODY =
      """
      {
        "filter": { "criteria": [
          { "field": "seedlotDisplay", "operator": "IN", "values": ["00098"] },
          { "field": "requestSkey", "operator": "NE", "values": [0] }
        ]},
        "sort": [ { "field": "actualEndDtTm", "direction": "DESC" } ],
        "page": 0,
        "size": 20
      }
      """;

  @Autowired private MockMvc mockMvc;

  @MockitoBean private ActivitySearchService activitySearchService;

  @Test
  @DisplayName("Search returns the standard page envelope")
  void searchOk() throws Exception {
    when(activitySearchService.search(any()))
        .thenReturn(new PageResponse<>(List.of(dummyRow()), new PageMeta(0, 20, 1, 1)));

    mockMvc
        .perform(
            post(SEARCH)
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content(BODY))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].seedlotDisplay").value("00098"))
        .andExpect(jsonPath("$.content[0].riaSkey").value(448383))
        .andExpect(jsonPath("$.content[0].activityUpdateTimestamp")
            .value("2026-05-01T10:15:30.123456"))
        .andExpect(jsonPath("$.page.totalElements").value(1))
        .andExpect(jsonPath("$.page.size").value(20));
  }

  @Test
  @DisplayName("Page size over the max is a 400")
  void sizeTooLarge() throws Exception {
    mockMvc
        .perform(
            post(SEARCH)
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"size\": 101}"))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("InvalidSearchException becomes a ProblemDetail 400")
  void invalidSearch() throws Exception {
    when(activitySearchService.search(any()))
        .thenThrow(new InvalidSearchException("Unknown field 'foo'"));

    mockMvc
        .perform(
            post(SEARCH)
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content(BODY))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.title").value("Invalid search request"))
        .andExpect(jsonPath("$.detail").value("Unknown field 'foo'"));
  }

  @Test
  @DisplayName("Missing lot numbers returns the list from the service")
  void missingLots() throws Exception {
    when(activitySearchService.findMissingLotNumbers(any())).thenReturn(List.of("99999"));

    mockMvc
        .perform(
            post(MISSING)
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content("[\"00098\", \"99999\"]"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0]").value("99999"));
  }

  private static ActivitySearchResponseDto dummyRow() {
    return new ActivitySearchResponseDto("00098", "RTS19981299A", "PLI", "D1", "A", 0, "STD", 88,
        "77//9", 0, 0, 0, 0, -1, -1, -1, LocalDate.of(1997, 10, 7).atTime(LocalTime.MAX),
        LocalDate.of(1997, 10, 10).atTime(LocalTime.MAX), LocalDate.of(1998, 10, 8).atStartOfDay(),
        LocalDate.of(1998, 11, 6).atTime(LocalTime.MAX), "Comment", 44115, "RTS19981299", "A",
        "00098", 448383, "D1", 0, 0, LocalDateTime.parse("2026-05-01T10:15:30.123456"));
  }
}
