package ca.bc.gov.oracleapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.SeedlotSpeciesDto;
import ca.bc.gov.oracleapi.service.RequestLotService;
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

@WebMvcTest(RequestSeedlotAndVeglotEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class RequestSeedlotAndVeglotEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private RequestLotService requestSeedlotAndVeglotService;

  @Test
  @DisplayName("isCommitmentIndicatorYesSuccessTrueTest")
  void isCommitmentIndicatorYesSuccessTrueTest() throws Exception {
    Long requestSkey = 123L;
    String itemId = "1";

    when(requestSeedlotAndVeglotService.isCommitmentIndicatorYes(requestSkey, itemId)).thenReturn(true);

    mockMvc
        .perform(
            get("/api/request-seedlot-and-veglot/commitment/{requestSkey}/{itemId}", requestSkey, itemId)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        // controller return type is boolean -> response body is "true"/"false"
        .andExpect(content().string("true"))
        .andReturn();
  }

  @Test
  @DisplayName("isCommitmentIndicatorYesSuccessFalseTest")
  void isCommitmentIndicatorYesSuccessFalseTest() throws Exception {
    Long requestSkey = 999L;
    String itemId = "88";

    when(requestSeedlotAndVeglotService.isCommitmentIndicatorYes(requestSkey, itemId)).thenReturn(false);

    mockMvc
        .perform(
            get("/api/request-seedlot-and-veglot/commitment/{requestSkey}/{itemId}", requestSkey, itemId)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().string("false"))
        .andReturn();
  }

  @Test
  @DisplayName("isCommitmentIndicatorYesUnauthorizedTest")
  @WithAnonymousUser
  void isCommitmentIndicatorYesUnauthorizedTest() throws Exception {
    mockMvc
        .perform(
            get("/api/request-seedlot-and-veglot/commitment/{requestSkey}/{itemId}", 123L, "1")
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized())
        .andReturn();
  }

  @Test
  @DisplayName("getSeedlotAndSpeciesSuccessTest")
  void getSeedlotAndSpeciesSuccessTest() throws Exception {
    Long requestKey = 500L;

    when(requestSeedlotAndVeglotService.getSeedlotAndSpecies(requestKey))
        .thenReturn(new SeedlotSpeciesDto(16258L, "PLI"));

    mockMvc
        .perform(
            get("/api/request-seedlot-and-veglot/seedlot-species/{requestKey}", requestKey)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.seedlotNumber").value(16258L))
        .andExpect(jsonPath("$.vegetationCode").value("PLI"))
        .andReturn();
  }

  @Test
  @DisplayName("getSeedlotAndSpeciesNotFoundTest")
  void getSeedlotAndSpeciesNotFoundTest() throws Exception {
    Long requestKey = 404L;

    when(requestSeedlotAndVeglotService.getSeedlotAndSpecies(requestKey))
        .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));

    mockMvc
        .perform(
            get("/api/request-seedlot-and-veglot/seedlot-species/{requestKey}", requestKey)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andReturn();
  }

  @Test
  @DisplayName("getSeedlotAndSpeciesUnauthorizedTest")
  @WithAnonymousUser
  void getSeedlotAndSpeciesUnauthorizedTest() throws Exception {
    mockMvc
        .perform(
            get("/api/request-seedlot-and-veglot/seedlot-species/{requestKey}", 500L)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized())
        .andReturn();
  }
}
