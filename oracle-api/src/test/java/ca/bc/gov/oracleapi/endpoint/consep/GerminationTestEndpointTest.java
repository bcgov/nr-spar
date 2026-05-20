package ca.bc.gov.oracleapi.endpoint.consep;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.consep.DailyAbnormalResponseDto;
import ca.bc.gov.oracleapi.dto.consep.ReplicateAbnormalDto;
import ca.bc.gov.oracleapi.service.consep.TestResultService;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

@WebMvcTest(GerminationTestEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_TSC_SUPERVISOR")
public class GerminationTestEndpointTest {
  
  @Autowired
  private MockMvc mockMvc;

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

    mockMvc
        .perform(get(BASE_URL + "/{dailyGermSkey}", key))
        .andExpect(status().isNotFound());
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
}
