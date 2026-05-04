package ca.bc.gov.oracleapi.endpoint.consep;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.consep.GerminationTestHeaderDto;
import ca.bc.gov.oracleapi.service.consep.TestResultService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

@WebMvcTest(GerminationTestEndpoint.class)
class GerminationTestEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private TestResultService testResultService;

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

  @Test
  @DisplayName("Get germination test header should return 403 for unauthorized role")
  @WithMockUser(username = "SPARTest", roles = "SPAR_VIEWER")
  void getGerminationTestHeader_shouldReturn403() throws Exception {
    BigDecimal riaKey = new BigDecimal("1234567890");

    mockMvc
        .perform(get("/api/germination-tests/{riaKey}", riaKey))
        .andExpect(status().isForbidden());
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
        "TSC" // requestTypeSt
        );
  }
}
