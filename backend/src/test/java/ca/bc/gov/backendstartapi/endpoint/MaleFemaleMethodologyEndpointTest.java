package ca.bc.gov.backendstartapi.endpoint;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(MaleFemaleMethodologyEndpoint.class)
class MaleFemaleMethodologyEndpointTest {

  @Autowired private MockMvc mockMvc;

  @Test
  @DisplayName("getAllConeCollectionMethodsTest")
  @WithMockUser(roles = "user_read")
  void getAllConeCollectionMethodsTest() throws Exception {
    mockMvc
        .perform(
            get("/api/male-female-methodologies")
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType("application/json"))
        .andExpect(jsonPath("$[0].code").value("F1"))
        .andExpect(jsonPath("$[0].description").value("Visual Estimate"))
        .andExpect(jsonPath("$[0].isPli").value(false))
        .andExpect(jsonPath("$[8].code").value("F9"))
        .andExpect(
            jsonPath("$[8].description").value("Ramet Proportion by Age and Expected Production"))
        .andExpect(jsonPath("$[8].isPli").value(true))
        .andExpect(jsonPath("$[9].code").value("M1"))
        .andExpect(jsonPath("$[9].description").value("Portion of Ramets in Orchard"))
        .andExpect(jsonPath("$[9].isPli").value(false))
        .andExpect(jsonPath("$[13].code").value("M5"))
        .andExpect(
            jsonPath("$[13].description").value("Ramet Proportion by Age and Expected Production"))
        .andExpect(jsonPath("$[13].isPli").value(true))
        .andReturn();
  }
}
