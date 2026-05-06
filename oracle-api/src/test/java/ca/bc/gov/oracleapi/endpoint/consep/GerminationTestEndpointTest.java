package ca.bc.gov.oracleapi.endpoint.consep;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.service.consep.TestResultService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(GerminationTestEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_TSC_SUPERVISOR")
class GerminationTestEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private TestResultService testResultService;

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
        .andExpect(jsonPath("$.rank").doesNotExist());

    verify(testResultService, times(1)).determineTestRank(seedlotNumber, "TST", 1);
  }

  @Test
  @WithAnonymousUser
  void determineTestRank_shouldReturn401_whenUnauthorizedRole() throws Exception {
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

    verify(testResultService, never()).determineTestRank(seedlotNumber, null, 1);
  }

  @Test
  void determineTestRank_shouldReturn400_whenMissingAcceptResult() throws Exception {
    String seedlotNumber = "12345";

    mockMvc
        .perform(
            get("/api/germination-tests/rank/{seedlotNumber}", seedlotNumber)
                .param("testCategoryCd", "STD"))
        .andExpect(status().isBadRequest());

    verify(testResultService, never()).determineTestRank(seedlotNumber, "STD", null);
  }
}
