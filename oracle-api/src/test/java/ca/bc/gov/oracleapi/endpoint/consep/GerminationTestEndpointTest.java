package ca.bc.gov.oracleapi.endpoint.consep;

import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.consep.DailyAbnormalResponseDto;
import ca.bc.gov.oracleapi.dto.consep.DailyAbnormalUpsertRequestDto;
import ca.bc.gov.oracleapi.dto.consep.GerminationTestHeaderDto;
import ca.bc.gov.oracleapi.dto.consep.ReplicateAbnormalDto;
import ca.bc.gov.oracleapi.service.consep.TestResultService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

@WebMvcTest(GerminationTestEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_TSC_SUPERVISOR")
public class GerminationTestEndpointTest {
  
  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @MockBean
  private TestResultService testResultService;

  private static final String BASE_URL = "/api/germination-tests/daily-abnormals";

  @Test
  void getDailyAbnormalCounts_returns200AndBody() throws Exception {
    BigDecimal key = new BigDecimal("12345");

    ReplicateAbnormalDto rep1 = new ReplicateAbnormalDto(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, null);
    ReplicateAbnormalDto rep2 =
        new ReplicateAbnormalDto(10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, null);
    ReplicateAbnormalDto rep3 =
        new ReplicateAbnormalDto(20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, null);
    ReplicateAbnormalDto rep4 =
        new ReplicateAbnormalDto(30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, null);

    DailyAbnormalResponseDto response = new DailyAbnormalResponseDto(key, rep1, rep2, rep3, rep4);
    when(testResultService.getDailyAbnormalCounts(key)).thenReturn(response);

    mockMvc
        .perform(get(BASE_URL + "/{dailyGermSkey}", key))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.dailyGermSkey").value(12345))
        .andExpect(jsonPath("$.rep1.abnormalNumReverseEmbryo").value(1))
        .andExpect(jsonPath("$.rep1.abnormalNumPregermination").value(11))
        .andExpect(jsonPath("$.rep1.totalSeeds").doesNotExist())
        .andExpect(jsonPath("$.rep2.abnormalNumStuntedRadicle").value(11))
        .andExpect(jsonPath("$.rep2.abnormalNumOther").value(19))
        .andExpect(jsonPath("$.rep3.abnormalNumRotten").value(23))
        .andExpect(jsonPath("$.rep3.abnormalNumTwisted").value(26))
        .andExpect(jsonPath("$.rep4.abnormalNumMegametophyteCollar").value(37))
        .andExpect(jsonPath("$.rep4.abnormalNumWeak").value(38));

    verify(testResultService).getDailyAbnormalCounts(key);
  }

  @ParameterizedTest
  @ValueSource(strings = {"0", "-1"})
  void getDailyAbnormalCounts_returns400_whenPathNotPositive(String badKey) throws Exception {
    mockMvc.perform(get(BASE_URL + "/{dailyGermSkey}", badKey)).andExpect(status().isBadRequest());

    verifyNoInteractions(testResultService);
  }

  @Test
  @WithAnonymousUser
  void getDailyAbnormalCounts_returns401_whenAnonymous() throws Exception {
    BigDecimal key = new BigDecimal("12345");

    mockMvc.perform(get(BASE_URL + "/{dailyGermSkey}", key)).andExpect(status().isUnauthorized());

    verifyNoInteractions(testResultService);
  }

  @Test
  @WithMockUser(username = "SPARTest", roles = "SPAR_NON_ORACLE_USER")
  void getDailyAbnormalCounts_returns403_whenUnauthorizedRole() throws Exception {
    BigDecimal key = new BigDecimal("12345");

    mockMvc.perform(get(BASE_URL + "/{dailyGermSkey}", key)).andExpect(status().isForbidden());

    verifyNoInteractions(testResultService);
  }

  @Test
  void getDailyAbnormalCounts_returns404_whenNotFound() throws Exception {
    BigDecimal key = new BigDecimal("12345");
    when(testResultService.getDailyAbnormalCounts(key))
        .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "not found"));

    mockMvc.perform(get(BASE_URL + "/{dailyGermSkey}", key)).andExpect(status().isNotFound());
    verify(testResultService).getDailyAbnormalCounts(key);
  }

  @Test
  void getDailyAbnormalCounts_returns422_whenInvalidData() throws Exception {
    BigDecimal key = new BigDecimal("12345");
    when(testResultService.getDailyAbnormalCounts(key))
        .thenThrow(new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "invalid counts"));

    mockMvc
        .perform(get(BASE_URL + "/{dailyGermSkey}", key))
        .andExpect(status().isUnprocessableEntity());
    verify(testResultService).getDailyAbnormalCounts(key);
  }

  @Test
  void upsertDailyAbnormalCounts_returns200AndBody() throws Exception {
    BigDecimal key = new BigDecimal("12345");
    DailyAbnormalUpsertRequestDto request = validDailyAbnormalRequest();
    DailyAbnormalResponseDto response = new DailyAbnormalResponseDto(
        key, request.rep1(), request.rep2(), request.rep3(), request.rep4());
    when(testResultService.upsertDailyAbnormalCounts(key, request)).thenReturn(response);

    mockMvc
        .perform(
            put(BASE_URL + "/{dailyGermSkey}", key)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.dailyGermSkey").value(12345))
        .andExpect(jsonPath("$.rep1.abnormalNumReverseEmbryo").value(1))
        .andExpect(jsonPath("$.rep4.abnormalNumPregermination").value(1));

    verify(testResultService).upsertDailyAbnormalCounts(key, request);
  }

  @ParameterizedTest
  @ValueSource(strings = {"0", "-1"})
  void upsertDailyAbnormalCounts_returns400_whenPathNotPositive(String badKey) throws Exception {
    mockMvc
        .perform(
            put(BASE_URL + "/{dailyGermSkey}", badKey)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validDailyAbnormalRequest())))
        .andExpect(status().isBadRequest());

    verifyNoInteractions(testResultService);
  }

  @Test
  void upsertDailyAbnormalCounts_returns400_whenAbnormalCountIsNegative() throws Exception {
    String invalidRequest = """
        {
          "updateTimestamp": "2026-05-01T10:00:00",
          "rep1": { "abnormalNumReverseEmbryo": -1 },
          "rep2": {},
          "rep3": {},
          "rep4": {}
        }
        """;

    mockMvc
        .perform(
            put(BASE_URL + "/{dailyGermSkey}", 12345)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest))
        .andExpect(status().isBadRequest());

    verifyNoInteractions(testResultService);
  }

  @Test
  @WithAnonymousUser
  void upsertDailyAbnormalCounts_returns401_whenAnonymous() throws Exception {
    mockMvc
        .perform(
            put(BASE_URL + "/{dailyGermSkey}", 12345)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validDailyAbnormalRequest())))
        .andExpect(status().isUnauthorized());

    verifyNoInteractions(testResultService);
  }

  @Test
  @WithMockUser(username = "SPARTest", roles = "SPAR_NON_ORACLE_USER")
  void upsertDailyAbnormalCounts_returns403_whenUnauthorizedRole() throws Exception {
    mockMvc
        .perform(
            put(BASE_URL + "/{dailyGermSkey}", 12345)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validDailyAbnormalRequest())))
        .andExpect(status().isForbidden());

    verifyNoInteractions(testResultService);
  }

  @Test
  void upsertDailyAbnormalCounts_returns404_whenNotFound() throws Exception {
    BigDecimal key = new BigDecimal("12345");
    DailyAbnormalUpsertRequestDto request = validDailyAbnormalRequest();
    when(testResultService.upsertDailyAbnormalCounts(key, request))
        .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "not found"));

    mockMvc
        .perform(
            put(BASE_URL + "/{dailyGermSkey}", key)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isNotFound());

    verify(testResultService).upsertDailyAbnormalCounts(key, request);
  }

  @Test
  void upsertDailyAbnormalCounts_returns422_whenInvalidData() throws Exception {
    BigDecimal key = new BigDecimal("12345");
    DailyAbnormalUpsertRequestDto request = validDailyAbnormalRequest();
    when(testResultService.upsertDailyAbnormalCounts(key, request))
        .thenThrow(new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "invalid counts"));

    mockMvc
        .perform(
            put(BASE_URL + "/{dailyGermSkey}", key)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isUnprocessableEntity());

    verify(testResultService).upsertDailyAbnormalCounts(key, request);
  }

  @Test
  void upsertDailyAbnormalCounts_returns400_whenUpdateTimestampMissing() throws Exception {
    String requestWithoutTimestamp = """
        {
          "rep1": {},
          "rep2": {},
          "rep3": {},
          "rep4": {}
        }
        """;

    mockMvc
        .perform(
            put(BASE_URL + "/{dailyGermSkey}", 12345)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestWithoutTimestamp))
        .andExpect(status().isBadRequest());

    verifyNoInteractions(testResultService);
  }

  @Test
  void upsertDailyAbnormalCounts_returns409_whenParentGermCountWasModified() throws Exception {
    BigDecimal key = new BigDecimal("12345");
    DailyAbnormalUpsertRequestDto request = validDailyAbnormalRequest();
    when(testResultService.upsertDailyAbnormalCounts(key, request))
        .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "stale"));

    mockMvc
        .perform(
            put(BASE_URL + "/{dailyGermSkey}", key)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isConflict());

    verify(testResultService).upsertDailyAbnormalCounts(key, request);
  }

  private DailyAbnormalUpsertRequestDto validDailyAbnormalRequest() {
    ReplicateAbnormalDto replicate =
        new ReplicateAbnormalDto(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, null);
    return new DailyAbnormalUpsertRequestDto(
        LocalDateTime.parse("2026-05-01T10:00:00"), replicate, replicate, replicate, replicate);
  }

  @Test
  void determineTestRank_shouldReturnA() throws Exception {
    String seedlotNumber = "12345";

    when(testResultService.determineTestRank(seedlotNumber, "STD", 1)).thenReturn("A");

    mockMvc
        .perform(
            get("/api/germination-tests/rank/{seedlotNumber}", seedlotNumber)
                .param("testCategoryCd", "STD")
                .param("acceptResultInd", "1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.rank").value("A"));

    verify(testResultService, times(1)).determineTestRank(seedlotNumber, "STD", 1);
  }

  @Test
  void determineTestRank_shouldReturnP() throws Exception {
    String seedlotNumber = "12345";

    when(testResultService.determineTestRank(seedlotNumber, "STD", 1)).thenReturn("P");

    mockMvc
        .perform(
            get("/api/germination-tests/rank/{seedlotNumber}", seedlotNumber)
                .param("testCategoryCd", "STD")
                .param("acceptResultInd", "1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.rank").value("P"));

    verify(testResultService, times(1)).determineTestRank(seedlotNumber, "STD", 1);
  }

  @Test
  void determineTestRank_shouldReturnNull() throws Exception {
    String seedlotNumber = "12345";

    when(testResultService.determineTestRank(seedlotNumber, "TST", 1)).thenReturn(null);

    mockMvc
        .perform(
            get("/api/germination-tests/rank/{seedlotNumber}", seedlotNumber)
                .param("testCategoryCd", "TST")
                .param("acceptResultInd", "1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.rank").value(nullValue()));

    verify(testResultService, times(1)).determineTestRank(seedlotNumber, "TST", 1);
  }

  @Test
  @WithAnonymousUser
  void determineTestRank_shouldReturn401_whenUnauthenticated() throws Exception {
    String seedlotNumber = "12345";

    mockMvc
        .perform(
            get("/api/germination-tests/rank/{seedlotNumber}", seedlotNumber)
                .param("testCategoryCd", "STD")
                .param("acceptResultInd", "1"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  @WithMockUser(username = "SPARTest", roles = "SPAR_VIEWER")
  void determineTestRank_shouldReturn403_forViewerRole() throws Exception {
    String seedlotNumber = "12345";

    mockMvc
        .perform(
            get("/api/germination-tests/rank/{seedlotNumber}", seedlotNumber)
                .param("testCategoryCd", "STD")
                .param("acceptResultInd", "1"))
        .andExpect(status().isForbidden());

    verify(testResultService, never()).determineTestRank(seedlotNumber, "STD", 1);
  }

  @Test
  void determineTestRank_shouldReturn400_whenMissingTestCategory() throws Exception {
    String seedlotNumber = "12345";

    mockMvc
        .perform(
            get("/api/germination-tests/rank/{seedlotNumber}", seedlotNumber)
                .param("acceptResultInd", "1"))
        .andExpect(status().isBadRequest());

    verifyNoInteractions(testResultService);
  }

  @Test
  void determineTestRank_shouldReturn400_whenMissingAcceptResult() throws Exception {
    String seedlotNumber = "12345";

    mockMvc
        .perform(
            get("/api/germination-tests/rank/{seedlotNumber}", seedlotNumber)
                .param("testCategoryCd", "STD"))
        .andExpect(status().isBadRequest());

    verifyNoInteractions(testResultService);
  }

  @Test
  @DisplayName("Get germination test header should succeed")
  @WithMockUser(username = "SPARTest", roles = "SPAR_TSC_SUPERVISOR")
  void getGerminationTestHeader_shouldSucceed() throws Exception {
    BigDecimal riaKey = new BigDecimal("1234567890");

    GerminationTestHeaderDto dto = createHeaderDto(riaKey);

    when(testResultService.getGerminationTestHeader(riaKey)).thenReturn(dto);

    mockMvc
        .perform(get("/api/germination-tests/{riaKey}", riaKey))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.riaSkey").value(1234567890L))
        .andExpect(jsonPath("$.activityTypeCd").value("G64"))
        .andExpect(jsonPath("$.testCategoryCd").value("TST"))
        .andExpect(jsonPath("$.moistureStatusCd").value("MOI"))
        .andExpect(jsonPath("$.sampleDesc").value("Primary sample"))
        .andExpect(jsonPath("$.acceptResultInd").value(1))
        .andExpect(jsonPath("$.testCompleteInd").value(1))
        .andExpect(jsonPath("$.requestTypeSt").value("TSC"));
  }

  @Test
  @DisplayName("Get germination test header should return 403 for unauthorized role")
  @WithMockUser(username = "SPARTest", roles = "SPAR_VIEWER")
  void getGerminationTestHeader_shouldReturn403() throws Exception {
    BigDecimal riaKey = new BigDecimal("1234567890");

    mockMvc
        .perform(get("/api/germination-tests/{riaKey}", riaKey))
        .andExpect(status().isForbidden());
  }

  @Test
  @DisplayName("Get germination test header should return 404 when key is missing")
  @WithMockUser(username = "SPARTest", roles = "SPAR_TSC_SUPERVISOR")
  void getGerminationTestHeader_shouldReturn404() throws Exception {
    BigDecimal riaKey = new BigDecimal("9999999999");

    when(testResultService.getGerminationTestHeader(riaKey))
        .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));

    mockMvc
        .perform(get("/api/germination-tests/{riaKey}", riaKey))
        .andExpect(status().isNotFound());
  }

  private static final String UPDATE_BODY = """
      {
        "testCategoryCode": "STD",
        "acceptResultInd": true,
        "testCompleteInd": true,
        "germinatorId": "A",
        "seedWithdrawalDate": "2026-04-30",
        "actualBeginDateTime": "2026-05-02T08:00:00",
        "actualEndDateTime": "2026-05-20T16:00:00",
        "riaComment": "looks good",
        "commentIsCritical": false,
        "testResultUpdateTimestamp": "2026-05-01T10:00:00",
        "riaUpdateTimestamp": "2026-05-01T11:00:00"
      }
      """;

  @Test
  void updateGerminationTest_validBody_returns200WithHeader() throws Exception {
    BigDecimal riaKey = new BigDecimal("1234567890");
    GerminationTestHeaderDto response = createHeaderDto(riaKey);
    when(testResultService.updateGerminationTest(eq(riaKey), any()))
        .thenReturn(response);

    mockMvc
        .perform(patch("/api/germination-tests/{riaKey}", riaKey)
            .with(csrf().asHeader())
            .contentType(MediaType.APPLICATION_JSON)
            .content(UPDATE_BODY))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.riaSkey").value(1234567890L))
        .andExpect(jsonPath("$.requestTypeSt").value("TSC"));

    verify(testResultService).updateGerminationTest(eq(riaKey), any());
  }

  @Test
  void updateGerminationTest_missingMandatoryField_returns400() throws Exception {
    String missingCategory = UPDATE_BODY.replace("\"testCategoryCode\": \"STD\",", "");

    mockMvc
        .perform(patch("/api/germination-tests/{riaKey}", new BigDecimal("1234"))
            .with(csrf().asHeader())
            .contentType(MediaType.APPLICATION_JSON)
            .content(missingCategory))
        .andExpect(status().isBadRequest());

    verifyNoInteractions(testResultService);
  }

  @Test
  void updateGerminationTest_serviceSaysConflict_returns409() throws Exception {
    when(testResultService.updateGerminationTest(any(), any()))
        .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "stale"));

    mockMvc
        .perform(patch("/api/germination-tests/{riaKey}", new BigDecimal("1234"))
            .with(csrf().asHeader())
            .contentType(MediaType.APPLICATION_JSON)
            .content(UPDATE_BODY))
        .andExpect(status().isConflict());
  }

  @Test
  void updateGerminationTest_serviceSaysUnprocessable_returns422() throws Exception {
    when(testResultService.updateGerminationTest(any(), any()))
        .thenThrow(new ResponseStatusException(
            HttpStatus.UNPROCESSABLE_ENTITY, "cannot accept incomplete test"));

    mockMvc
        .perform(patch("/api/germination-tests/{riaKey}", new BigDecimal("1234"))
            .with(csrf().asHeader())
            .contentType(MediaType.APPLICATION_JSON)
            .content(UPDATE_BODY))
        .andExpect(status().isUnprocessableEntity());
  }

  @Test
  void updateGerminationTest_serviceSaysNotFound_returns404() throws Exception {
    when(testResultService.updateGerminationTest(any(), any()))
        .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "missing"));

    mockMvc
        .perform(patch("/api/germination-tests/{riaKey}", new BigDecimal("1234"))
            .with(csrf().asHeader())
            .contentType(MediaType.APPLICATION_JSON)
            .content(UPDATE_BODY))
        .andExpect(status().isNotFound());
  }

  private GerminationTestHeaderDto createHeaderDto(BigDecimal riaKey) {
    return new GerminationTestHeaderDto(
        riaKey, // riaSkey
        "G64", // activityTypeCd
        LocalDateTime.parse("2026-04-15T08:30:00"), // actualBeginDtTm
        LocalDateTime.parse("2026-04-18T16:00:00"), // actualEndDtTm
        "TST", // testCategoryCd
        "MOI", // moistureStatusCd
        "Primary sample", // sampleDesc
        1, // acceptResultInd
        1, // testCompleteInd
        "Test comment", // riaComment
        1, // standardTestInd
        "A", // testRank
        95, // germinationPct
        90, // germinationValue
        88, // peakValueGrmPct
        14, // peakValueNoDays
        LocalDate.parse("2026-04-10"), // seedWithdrawalDate
        LocalDate.parse("2026-04-01"), // revisedStartDt
        LocalDate.parse("2026-04-20"), // revisedEndDt
        72, // activityDuration
        "HRS", // actvtyTmUnitSt
        LocalDate.parse("2026-03-20"), // stratStartDt
        LocalDate.parse("2026-03-25"), // drybackStartDate
        LocalDate.parse("2026-03-22"), // warmStratStartDate
        LocalDate.parse("2026-03-30"), // germinatorEntry
        101, // germinatorTrayId
        "1", // germinatorId
        LocalDateTime.parse("2026-04-15T20:30:00"), // soakEndDate
        new BigDecimal("12.345"), // imbibedWt
        new BigDecimal("10.220"), // dryWeight
        new BigDecimal("9.880"), // drybackWeight
        0, // intrmdtCleanrInd
        "TSC", // requestTypeSt
        LocalDateTime.parse("2026-05-01T10:00:00"), // testResultUpdateTimestamp
        LocalDateTime.parse("2026-05-01T11:00:00") // riaUpdateTimestamp
    );
  }
}
