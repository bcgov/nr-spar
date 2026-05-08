package ca.bc.gov.oracleapi.endpoint.consep;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.consep.TestRepGermDto;
import ca.bc.gov.oracleapi.service.consep.TestRepGermService;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(TestRepGermEndpoint.class)
class TestRepGermEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private TestRepGermService testRepGermService;

  private TestRepGermDto buildDto(BigDecimal riaKey, int replicateNumber, int totalSeeds) {
    return new TestRepGermDto(
        riaKey,
        replicateNumber,
        totalSeeds,
        1, 2, 3, 4, 5, 6, 7,
        1,
        "ok"
    );
  }

  @Test
  @DisplayName("Get test replicates should succeed")
  @WithMockUser(username = "SPARTest", roles = "SPAR_TSC_SUPERVISOR")
  void getTestReplicates_shouldSucceed() throws Exception {
    BigDecimal riaKey = new BigDecimal("881191");
    List<TestRepGermDto> replicates =
        List.of(buildDto(riaKey, 1, 100), buildDto(riaKey, 2, 50));

    when(testRepGermService.getTestReplicates(riaKey)).thenReturn(replicates);

    mockMvc
        .perform(get("/api/test-replicates/{riaKey}", riaKey))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(2))
        .andExpect(jsonPath("$[0].riaKey").value(881191))
        .andExpect(jsonPath("$[0].replicateNumber").value(1))
        .andExpect(jsonPath("$[0].totalNoSeeds").value(100))
        .andExpect(jsonPath("$[0].finalUngrmNormal").value(1))
        .andExpect(jsonPath("$[0].finalPregerm").value(7))
        .andExpect(jsonPath("$[0].repAcceptedInd").value(1))
        .andExpect(jsonPath("$[0].tolrncOvrrdeDesc").value("ok"))
        .andExpect(jsonPath("$[1].replicateNumber").value(2))
        .andExpect(jsonPath("$[1].totalNoSeeds").value(50));
  }

  @Test
  @DisplayName("Get test replicates should return empty list when none found")
  @WithMockUser(username = "SPARTest", roles = "SPAR_TSC_SUBMITTER")
  void getTestReplicates_shouldReturnEmpty() throws Exception {
    BigDecimal riaKey = new BigDecimal("100001");

    when(testRepGermService.getTestReplicates(riaKey)).thenReturn(Collections.emptyList());

    mockMvc
        .perform(get("/api/test-replicates/{riaKey}", riaKey))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(0));
  }

  @Test
  @DisplayName("Get test replicates should return 401 when unauthenticated")
  @WithAnonymousUser
  void getTestReplicates_shouldReturn401() throws Exception {
    mockMvc
        .perform(get("/api/test-replicates/881191"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  @DisplayName("Get test replicates should return 403 for unauthorized role")
  @WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
  void getTestReplicates_shouldReturn403() throws Exception {
    mockMvc
        .perform(get("/api/test-replicates/881191"))
        .andExpect(status().isForbidden());
  }

  @Test
  @DisplayName("Get test replicates should return 400 for non-positive riaKey")
  @WithMockUser(username = "SPARTest", roles = "SPAR_TSC_SUPERVISOR")
  void getTestReplicates_shouldReturn400() throws Exception {
    mockMvc
        .perform(get("/api/test-replicates/0"))
        .andExpect(status().isBadRequest());
  }
}
