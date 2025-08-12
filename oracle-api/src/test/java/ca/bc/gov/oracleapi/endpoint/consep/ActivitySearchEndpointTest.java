package ca.bc.gov.oracleapi.endpoint.consep;

import ca.bc.gov.oracleapi.dto.consep.ActivitySearchRequestDto;
import ca.bc.gov.oracleapi.dto.consep.ActivitySearchResponseDto;
import ca.bc.gov.oracleapi.service.consep.ActivitySearchService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import static org.springframework.http.MediaType.APPLICATION_JSON;


@WebMvcTest(ActivitySearchEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class ActivitySearchEndpointTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private ActivitySearchService activitySearchService;

  @Autowired
  private ObjectMapper objectMapper;

  private ActivitySearchResponseDto activitySearchResponseDto;

  private String seedlotDisplay, species, requestId, testCategoryCd;

  @BeforeEach
  void setUp() {
    // response parameter
    seedlotDisplay = "00098";
    requestId = "RTS19981299A";
    species = "PLI";
    String activityId = "D1";
    String testRank = "A";
    Integer currentTestInd = 0;
    testCategoryCd = "STD";
    Integer germinationPct = 88;
    String pv = "77//9";
    Integer moisturePct = 0;
    Integer purityPct = 0;
    Integer seedsPerGram = 0;
    Integer otherTestResult = 0;
    Boolean testCompleteInd = true;
    Integer acceptanceStatus = -1;
    Integer significntStsInd = -1;
    LocalDate seedWithdrawalDate = LocalDate.of(1997, 10, 7);
    LocalDate revisedEndDt = LocalDate.of(1997, 10, 10);
    LocalDateTime actualBeginDtTm = LocalDate.of(1998, 10, 8).atTime(0, 0);
    LocalDateTime actualEndDtTm = LocalDate.of(1998, 11, 6).atTime(0, 0);
    String riaComment = "Comment";
    Integer requestSkey = 44115;
    String reqId = "RTS19981299";
    String itemId = "A";
    String seedlotSample = "00098";
    Integer riaSkey = 448383;

    activitySearchResponseDto = new ActivitySearchResponseDto(
      seedlotDisplay, requestId, species, activityId, testRank, currentTestInd,
      testCategoryCd, germinationPct, pv, moisturePct, purityPct, seedsPerGram,
      otherTestResult, testCompleteInd, acceptanceStatus, significntStsInd, seedWithdrawalDate,
      revisedEndDt, actualBeginDtTm, actualEndDtTm, riaComment, requestSkey,
      reqId, itemId, seedlotSample, riaSkey
    );
  }

  @Test
  void searchTestingActivityData_shouldSucceed() throws Exception {
    // request parameter for filtering
    List<String> lotNumbers = List.of("00098");
    String testType = "D1";
    String activityId = "D1";
    Integer germinatorTrayId = null;
    LocalDate seedWithdrawalStartDate = LocalDate.of(1997, 10, 1);
    LocalDate seedWithdrawalEndDate = LocalDate.of(1998, 10, 31);
    Boolean includeHistoricalTests = false;
    Boolean germTestsOnly = true;
    String requestType = "RTS";
    Integer requestYear = 1998;
    String orchardId = null;
    String testRank = "A"; // testRank
    LocalDate actualBeginDateFrom = LocalDate.of(1997, 10, 1);
    LocalDate actualBeginDateTo = LocalDate.of(1997, 10, 10);
    LocalDate actualEndDateFrom = LocalDate.of(1997, 11, 1);
    LocalDate actualEndDateTo = LocalDate.of(1997, 11, 10);
    LocalDate revisedStartDateFrom = LocalDate.of(1997, 10, 1);
    LocalDate revisedStartDateTo = LocalDate.of(1997, 10, 10);
    LocalDate revisedEndDateFrom = LocalDate.of(1997, 11, 1);
    LocalDate revisedEndDateTo = LocalDate.of(1997, 11, 10);
    Integer germTrayAssignment = -1;
    Integer completeStatus = -1;
    Integer acceptanceStatus = -1;
    String seedlotClass = "A";


    ActivitySearchRequestDto activitySearchRequestDto = new ActivitySearchRequestDto(
      lotNumbers, testType, activityId, germinatorTrayId,
      seedWithdrawalStartDate, seedWithdrawalEndDate,
      includeHistoricalTests, germTestsOnly, requestId, requestType,
      requestYear, orchardId, testCategoryCd, testRank, species,
      actualBeginDateFrom, actualBeginDateTo,
      actualEndDateFrom, actualEndDateTo,
      revisedStartDateFrom, revisedStartDateTo,
      revisedEndDateFrom, revisedEndDateTo,
      germTrayAssignment, completeStatus, acceptanceStatus, seedlotClass
    );


    Mockito.when(activitySearchService.searchActivities(Mockito.any(), Mockito.any()))
      .thenReturn(List.of(activitySearchResponseDto));


    mockMvc.perform(post("/api/testing-activities/search")
        .with(csrf().asHeader())
        .contentType(APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(activitySearchRequestDto))
        .accept(APPLICATION_JSON))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$", hasSize(1)))
      .andExpect(jsonPath("$[0].seedlotDisplay").value(seedlotDisplay))
      .andExpect(jsonPath("$[0].requestItem").value(requestId))
      .andExpect(jsonPath("$[0].species").value(species))
      .andExpect(jsonPath("$[0].testCategoryCd").value(testCategoryCd));
  }
}
