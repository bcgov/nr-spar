package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.dto.SeedlotSpeciesDto;
import ca.bc.gov.backendstartapi.exception.SeedlotNotFoundException;
import ca.bc.gov.backendstartapi.service.PlantingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

@WebMvcTest(PlantingEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class PlantingEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private PlantingService plantingService;

  @Test
  @DisplayName("getSeedlotAndSpeciesByRequestKeySuccessTest")
  void getSeedlotAndSpeciesByRequestKeySuccessTest() throws Exception {
    Long requestKey = 500L;

    when(plantingService.getSeedlotAndSpeciesByRequestKey(requestKey))
        .thenReturn(new SeedlotSpeciesDto(16258L, "PLI"));

    mockMvc
        .perform(
            get("/api/planting/request-key/{requestKey}", requestKey)
                .with(csrf().asHeader())
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.seedlotNumber").value(16258L))
        .andExpect(jsonPath("$.vegetationCode").value("PLI"))
        .andReturn();
  }

  @Test
  @DisplayName("getSeedlotAndSpeciesByRequestKeyNotFoundTest")
  void getSeedlotAndSpeciesByRequestKeyNotFoundTest() throws Exception {
    Long requestKey = 404L;

    when(plantingService.getSeedlotAndSpeciesByRequestKey(requestKey))
        .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));

    mockMvc
        .perform(
            get("/api/planting/request-key/{requestKey}", requestKey)
                .with(csrf().asHeader())
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andReturn();
  }

  @Test
  @DisplayName("getSeedlotAndSpeciesByRequestKeyUnauthorizedTest")
  @WithAnonymousUser
  void getSeedlotAndSpeciesByRequestKeyUnauthorizedTest() throws Exception {
    mockMvc
        .perform(
            get("/api/planting/request-key/{requestKey}", 500L)
                .with(csrf().asHeader())
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized())
        .andReturn();
  }

  @Test
  @DisplayName("getSpeciesBySeedlotSuccessTest")
  void getSpeciesBySeedlotSuccessTest() throws Exception {
    when(plantingService.getSpeciesBySeedlot("16258"))
        .thenReturn(new SeedlotSpeciesDto(16258L, "PLI"));

    mockMvc
        .perform(
            get("/api/planting/seedlot/{seedlotNumber}", "16258")
                .with(csrf().asHeader())
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.seedlotNumber").value(16258L))
        .andExpect(jsonPath("$.vegetationCode").value("PLI"))
        .andReturn();
  }

  @Test
  @DisplayName("getSpeciesBySeedlotNotFoundTest")
  void getSpeciesBySeedlotNotFoundTest() throws Exception {
    when(plantingService.getSpeciesBySeedlot("99999")).thenThrow(new SeedlotNotFoundException());

    mockMvc
        .perform(
            get("/api/planting/seedlot/{seedlotNumber}", "99999")
                .with(csrf().asHeader())
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(status().reason("Seedlot doesn't exist"))
        .andReturn();
  }

  @Test
  @DisplayName("getSpeciesBySeedlotUnauthorizedTest")
  @WithAnonymousUser
  void getSpeciesBySeedlotUnauthorizedTest() throws Exception {
    mockMvc
        .perform(
            get("/api/planting/seedlot/{seedlotNumber}", "16258")
                .with(csrf().asHeader())
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized())
        .andReturn();
  }
}
