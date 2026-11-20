package ca.bc.gov.oracleapi.endpoint;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.repository.SeedPlanZoneCodeRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

@WebMvcTest(SeedPlanZoneEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class SeedPlanZoneEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private SeedPlanZoneCodeRepository seedPlanZoneCodeRepository;

  private ResultActions perform(String code) throws Exception {
    return mockMvc.perform(
        get("/api/seed-plan-zones/{code}/coast-interior", code)
            .with(csrf().asHeader())
            .header("Content-Type", "application/json")
            .accept(MediaType.APPLICATION_JSON));
  }

  @Test
  @DisplayName("Coastal zone returns C, upper-casing the code")
  void coastalZoneTest() throws Exception {
    when(seedPlanZoneCodeRepository.isCoastalZone("M")).thenReturn(1);

    perform("m")
        .andExpect(status().isOk())
        .andExpect(content().contentType("application/json"))
        .andExpect(jsonPath("$.seedPlanZoneCode").value("M"))
        .andExpect(jsonPath("$.coastInteriorCode").value("C"));
  }

  @Test
  @DisplayName("Zone not listed as coastal returns I")
  void interiorZoneTest() throws Exception {
    when(seedPlanZoneCodeRepository.isCoastalZone("EK")).thenReturn(0);

    perform("EK")
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.seedPlanZoneCode").value("EK"))
        .andExpect(jsonPath("$.coastInteriorCode").value("I"));
  }

  @Test
  @DisplayName("Invalid zone code returns 400")
  void invalidCodeTest() throws Exception {
    perform("ABCD").andExpect(status().isBadRequest());
    perform("M1").andExpect(status().isBadRequest());
    verifyNoInteractions(seedPlanZoneCodeRepository);
  }

  @Test
  @DisplayName("Unauthorized")
  @WithAnonymousUser
  void unauthorizedTest() throws Exception {
    perform("M").andExpect(status().isUnauthorized());
  }
}
