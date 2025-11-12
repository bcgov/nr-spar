package ca.bc.gov.oracleapi.endpoint.consep;

import static org.hamcrest.Matchers.hasSize;
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
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ActivitySearchEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class ActivitySearchEndpointTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private ActivitySearchService activitySearchService;

  @MockBean
  private TestCodeService testCodeService;

  @Autowired
  private ObjectMapper objectMapper;

  // Test for /search
  @Test
  void searchTestingActivityData_shouldSucceed() throws Exception {
    // response parameter
    String seedlotDisplay = "00098";
    String requestId = "RTS19981299A";
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
    LocalDateTime seedWithdrawalDate = LocalDate.of(1997, 10, 7).atTime(LocalTime.MAX);
    LocalDateTime revisedEndDt = LocalDate.of(1997, 10, 10).atTime(LocalTime.MAX);
    LocalDateTime actualBeginDtTm = LocalDate.of(1998, 10, 8).atStartOfDay();
    LocalDateTime actualEndDtTm = LocalDate.of(1998, 11, 6).atTime(LocalTime.MAX);
    String riaComment = "Comment";
    Integer requestSkey = 44115;
    String reqId = "RTS19981299";
    String itemId = "A";
    String seedlotSample = "00098";
    Integer riaSkey = 448383;

    ActivitySearchResponseDto activitySearchResponseDto = new ActivitySearchResponseDto(
        seedlotDisplay, requestId, species, activityId, testRank, currentTestInd,
        testCategoryCd, germinationPct, pv, moisturePct, purityPct, seedsPerGram,
        otherTestResult, testCompleteInd, acceptanceStatus, significntStsInd, seedWithdrawalDate,
        revisedEndDt, actualBeginDtTm, actualEndDtTm, riaComment, requestSkey,
        reqId, itemId, seedlotSample, riaSkey
    );

    // request parameter for filtering
    List<String> lotNumbers = List.of("00098");
    String testType = "D1";
    Integer germinatorTrayId = null;
    LocalDate seedWithdrawalStartDate = LocalDate.of(1997, 10, 1);
    LocalDate seedWithdrawalEndDate = LocalDate.of(1998, 10, 31);
    Boolean includeHistoricalTests = false;
    Boolean germTestsOnly = true;
    String requestType = "RTS";
    Integer requestYear = 1998;
    String orchardId = null;
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
    String geneticClassCode = "A";

    ActivitySearchRequestDto activitySearchRequestDto = new ActivitySearchRequestDto(
        lotNumbers, testType, activityId, germinatorTrayId,
        seedWithdrawalStartDate, seedWithdrawalEndDate,
        includeHistoricalTests, germTestsOnly, requestId, requestType,
        requestYear, orchardId, testCategoryCd, testRank, species,
        actualBeginDateFrom, actualBeginDateTo,
        actualEndDateFrom, actualEndDateTo,
        revisedStartDateFrom, revisedStartDateTo,
        revisedEndDateFrom, revisedEndDateTo,
        germTrayAssignment, completeStatus, acceptanceStatus, geneticClassCode
    );

    // Mock paginated response
    ActivitySearchPageResponseDto pageResponse = new ActivitySearchPageResponseDto(
        List.of(activitySearchResponseDto), // content
        1L,                                 // totalElements
        1,                                  // totalPages
        0,                                  // pageNumber
        20                                  // pageSize
    );

    Mockito.when(activitySearchService.searchTestingActivities(Mockito.any(), Mockito.any()))
        .thenReturn(pageResponse);

    mockMvc.perform(post("/api/testing-activities/search")
            .with(csrf().asHeader())
            .contentType(APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(activitySearchRequestDto))
            .accept(APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content", hasSize(1)))
        .andExpect(jsonPath("$.content[0].seedlotDisplay").value(seedlotDisplay))
        .andExpect(jsonPath("$.content[0].requestItem").value(requestId))
        .andExpect(jsonPath("$.content[0].species").value(species))
        .andExpect(jsonPath("$.content[0].testCategoryCd").value(testCategoryCd))
        .andExpect(jsonPath("$.totalElements").value(1));
  }

  // Test for /type-codes
  @Test
  void getTestTypeCodes_shouldReturnList() throws Exception {
    List<TestCodeDto> mockCodes = List.of(
        new TestCodeDto("TT1", "TEST type 1"),
        new TestCodeDto("TT2", "TEST type 2")
    );

    Mockito.when(testCodeService.getTestTypeCodes()).thenReturn(mockCodes);

    mockMvc.perform(get("/api/testing-activities/type-codes")
            .with(csrf().asHeader())
            .accept(APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$[0].code").value("TT1"))
        .andExpect(jsonPath("$[0].description").value("TEST type 1"))
        .andExpect(jsonPath("$[1].code").value("TT2"))
        .andExpect(jsonPath("$[1].description").value("TEST type 2"));
  }


  // Test for /category-codes
  @Test
  void getTestCategoryCodes_shouldReturnList() throws Exception {
    List<TestCodeDto> mockCodes = List.of(
        new TestCodeDto("CAT1", "Category 1"),
        new TestCodeDto("CAT2", "Category 2")
    );

    Mockito.when(testCodeService.getTestCategoryCodes()).thenReturn(mockCodes);

    mockMvc.perform(get("/api/testing-activities/category-codes")
            .with(csrf().asHeader())
            .accept(APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$[0].code").value("CAT1"))
        .andExpect(jsonPath("$[0].description").value("Category 1"))
        .andExpect(jsonPath("$[1].code").value("CAT2"))
        .andExpect(jsonPath("$[1].description").value("Category 2"));
  }
}
