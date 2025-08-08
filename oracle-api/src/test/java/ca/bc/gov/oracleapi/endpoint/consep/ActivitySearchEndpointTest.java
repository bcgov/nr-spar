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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.http.MediaType.APPLICATION_JSON;


@WebMvcTest(ActivitySearchEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class ActivitySearchEndpointTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private ActivitySearchService activitySearchService;

  private ActivitySearchResponseDto activitySearchResponseDto;

  @BeforeEach
  void setUp() {
    // response parameter
    String seedlotDisplay = "00098";
    String requestItem = "RTS19981299A";
    String species = "PLI";
    String activityId = "D1";
    String testRank = "A";
    Integer currentTestInd = 0;
    String testCategoryCd = "STD";
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
      seedlotDisplay, requestItem, species, activityId, testRank, currentTestInd,
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
    String requestId = "RTS19981299A";
    String requestType = "RTS";
    Integer requestYear = 1998;
    String orchardId = null;
    String testCategoryCd = "STD";
    String testRank = "A"; // testRank
    String species = "PLI"; // species
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

    Mockito.when(activitySearchService.searchActivities(Mockito.any(), Mockito.any()))
      .thenReturn(List.of(activitySearchResponseDto));

    mockMvc.perform(get("/api/testing-activities/search")
        .param("lotNumbers", lotNumbers.toArray(new String[0]))
        .param("testType", testType)
        .param("activityId", activityId)
        .param("requestId", requestId)
        .param("requestType", requestType)
        .param("requestYear", requestYear.toString())
        .param("testCategoryCd", testCategoryCd)
        .param("testRank", testRank)
        .param("species", species)
        .param("seedWithdrawalStartDate", seedWithdrawalStartDate.toString())
        .param("seedWithdrawalEndDate", seedWithdrawalEndDate.toString())
        .param("actualBeginDateFrom", actualBeginDateFrom.toString())
        .param("actualBeginDateTo", actualBeginDateTo.toString())
        .param("actualEndDateFrom", actualEndDateFrom.toString())
        .param("actualEndDateTo", actualEndDateTo.toString())
        .param("revisedStartDateFrom", revisedStartDateFrom.toString())
        .param("revisedStartDateTo", revisedStartDateTo.toString())
        .param("revisedEndDateFrom", revisedEndDateFrom.toString())
        .param("revisedEndDateTo", revisedEndDateTo.toString())
        .param("germTestsOnly", germTestsOnly.toString())
        .param("includeHistoricalTests", includeHistoricalTests.toString())
        .param("germTrayAssignment", germTrayAssignment.toString())
        .param("completeStatus", completeStatus.toString())
        .param("acceptanceStatus", acceptanceStatus.toString())
        .param("seedlotClass", seedlotClass)
        .accept(APPLICATION_JSON))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$", hasSize(1)))
      .andExpect(jsonPath("$[0].seedlotDisplay").value("00098"))
      .andExpect(jsonPath("$[0].requestItem").value(requestId))
      .andExpect(jsonPath("$[0].species").value(species));
  }
}
