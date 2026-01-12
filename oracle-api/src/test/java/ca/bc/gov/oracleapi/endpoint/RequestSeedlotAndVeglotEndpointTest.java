package ca.bc.gov.oracleapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.service.RequestLotService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(RequestSeedlotAndVeglotEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class RequestSeedlotAndVeglotEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private RequestLotService requestSeedlotAndVeglotService;

  @Test
  @DisplayName("isCommitmentCheckedSuccessTrueTest")
  void isCommitmentCheckedSuccessTrueTest() throws Exception {
    Long requestSkey = 123L;
    String itemId = "1";

    when(requestSeedlotAndVeglotService.isCommitmentChecked(requestSkey, itemId)).thenReturn(true);

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
  @DisplayName("isCommitmentCheckedSuccessFalseTest")
  void isCommitmentCheckedSuccessFalseTest() throws Exception {
    Long requestSkey = 999L;
    String itemId = "88";

    when(requestSeedlotAndVeglotService.isCommitmentChecked(requestSkey, itemId)).thenReturn(false);

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
  @DisplayName("isCommitmentCheckedNoAuthorizedTest")
  @WithAnonymousUser
  void isCommitmentCheckedNoAuthorizedTest() throws Exception {
    mockMvc
        .perform(
            get("/api/request-seedlot-and-veglot/commitment/{requestSkey}/{itemId}", 123L, "1")
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized())
        .andReturn();
  }
}
