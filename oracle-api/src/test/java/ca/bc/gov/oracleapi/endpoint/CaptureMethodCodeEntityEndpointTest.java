package ca.bc.gov.oracleapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.CodeDescriptionDto;
import ca.bc.gov.oracleapi.repository.CaptureMethodRepository;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(CaptureMethodEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class CaptureMethodCodeEntityEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private CaptureMethodRepository captureMethodRepository;

  @Test
  @DisplayName("findAllSuccessTest")
  void findAllSuccessTest() throws Exception {
    when(captureMethodRepository.findAllValid())
        .thenReturn(
            List.of(
                new CodeDescriptionDto(
                    "GPS",
                    "GPS",
                    LocalDate.parse("1905-01-01"),
                    LocalDate.parse("9999-12-31")),
                new CodeDescriptionDto(
                    "MAP",
                    "Map",
                    LocalDate.parse("1905-01-01"),
                    LocalDate.parse("9999-12-31"))));

    mockMvc
        .perform(
            get("/api/capture-methods")
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].code").value("GPS"))
        .andExpect(jsonPath("$[0].description").value("GPS"))
        .andExpect(jsonPath("$[0].effectiveDate").value("1905-01-01"))
        .andExpect(jsonPath("$[0].expiryDate").value("9999-12-31"))
        .andExpect(jsonPath("$[1].code").value("MAP"))
        .andExpect(jsonPath("$[1].description").value("Map"))
        .andReturn();
  }

  @Test
  @DisplayName("findAllNoAuthorizedTest")
  @WithAnonymousUser
  void findAllNoAuthorizedTest() throws Exception {
    mockMvc
        .perform(
            get("/api/capture-methods")
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized())
        .andReturn();
  }
}
