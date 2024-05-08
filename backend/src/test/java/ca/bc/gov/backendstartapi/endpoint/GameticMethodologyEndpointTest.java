package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.dto.GameticMethodologyDto;
import ca.bc.gov.backendstartapi.service.GameticMethodologyService;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(GameticMethodologyEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class GameticMethodologyEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private GameticMethodologyService gameticMethodologyService;

  @Test
  @DisplayName("getAllConeCollectionMethodsTest")
  void getAllConeCollectionMethodsTest() throws Exception {
    GameticMethodologyDto firstMethod =
        new GameticMethodologyDto("F1", "Visual Estimate", true, false);
    GameticMethodologyDto secondMethod =
        new GameticMethodologyDto("F8", "Ramet Proportion by Clone", true, true);
    GameticMethodologyDto thirdMethod =
        new GameticMethodologyDto("M1", "Portion of Ramets in Orchard", false, false);
    GameticMethodologyDto fourthMethod =
        new GameticMethodologyDto(
            "M5", "Ramet Proportion by Age and Expected Production", false, true);

    when(gameticMethodologyService.getAllGameticMethodologies())
        .thenReturn(List.of(firstMethod, secondMethod, thirdMethod, fourthMethod));

    mockMvc
        .perform(
            get("/api/gametic-methodologies")
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType("application/json"))
        .andExpect(jsonPath("$[0].code").value("F1"))
        .andExpect(jsonPath("$[0].description").value("Visual Estimate"))
        .andExpect(jsonPath("$[0].isFemaleMethodology").value(true))
        .andExpect(jsonPath("$[0].isPliSpecies").value(false))
        .andExpect(jsonPath("$[1].code").value("F8"))
        .andExpect(jsonPath("$[1].description").value("Ramet Proportion by Clone"))
        .andExpect(jsonPath("$[1].isFemaleMethodology").value(true))
        .andExpect(jsonPath("$[1].isPliSpecies").value(true))
        .andExpect(jsonPath("$[2].code").value("M1"))
        .andExpect(jsonPath("$[2].description").value("Portion of Ramets in Orchard"))
        .andExpect(jsonPath("$[2].isFemaleMethodology").value(false))
        .andExpect(jsonPath("$[2].isPliSpecies").value(false))
        .andExpect(jsonPath("$[3].code").value("M5"))
        .andExpect(
            jsonPath("$[3].description").value("Ramet Proportion by Age and Expected Production"))
        .andExpect(jsonPath("$[3].isFemaleMethodology").value(false))
        .andExpect(jsonPath("$[3].isPliSpecies").value(true))
        .andReturn();
  }
}
