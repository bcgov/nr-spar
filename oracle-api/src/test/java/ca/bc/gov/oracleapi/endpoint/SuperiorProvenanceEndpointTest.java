package ca.bc.gov.oracleapi.endpoint;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.dto.SuperiorProvenanceDto;
import ca.bc.gov.oracleapi.repository.SuperiorProvenanceRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SuperiorProvenanceEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class SuperiorProvenanceEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private SuperiorProvenanceRepository superiorProvenanceRepository;

  private static final String API_PATH = "/api/superior-provenances?vegetationCode=FDC";

  @Test
  @DisplayName("findByVegetationCode returns provenance list")
  void findByVegetationCodeTest() throws Exception {
    when(superiorProvenanceRepository.findValidByVegetationCode(any()))
        .thenReturn(List.of(new SuperiorProvenanceDto(1, "FDC", "Fraser Valley Provenance")));

    mockMvc
        .perform(
            get(API_PATH)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType("application/json"))
        .andExpect(jsonPath("$[0].provenanceId").value(1))
        .andExpect(jsonPath("$[0].vegetationCode").value("FDC"))
        .andExpect(jsonPath("$[0].provenanceDescription").value("Fraser Valley Provenance"))
        .andReturn();
  }

  @Test
  @DisplayName("findByVegetationCode returns empty list")
  void findByVegetationCodeEmptyTest() throws Exception {
    when(superiorProvenanceRepository.findValidByVegetationCode(any())).thenReturn(List.of());

    mockMvc
        .perform(
            get(API_PATH)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isEmpty())
        .andReturn();
  }

  @Test
  @DisplayName("findById returns the provenance")
  void findByIdTest() throws Exception {
    when(superiorProvenanceRepository.findDtoById(7))
        .thenReturn(Optional.of(new SuperiorProvenanceDto(7, "FDC", "Fraser Valley Provenance")));

    mockMvc
        .perform(
            get("/api/superior-provenances/7")
                .with(csrf().asHeader())
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.provenanceId").value(7))
        .andExpect(jsonPath("$.vegetationCode").value("FDC"))
        .andExpect(jsonPath("$.provenanceDescription").value("Fraser Valley Provenance"));
  }

  @Test
  @DisplayName("findById returns 404 for an unknown id")
  void findByIdNotFoundTest() throws Exception {
    when(superiorProvenanceRepository.findDtoById(99)).thenReturn(Optional.empty());

    mockMvc
        .perform(
            get("/api/superior-provenances/99")
                .with(csrf().asHeader())
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("findById rejects a non-numeric id")
  void findByIdBadRequestTest() throws Exception {
    mockMvc
        .perform(
            get("/api/superior-provenances/abc")
                .with(csrf().asHeader())
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("findByVegetationCode unauthorized")
  @WithAnonymousUser
  void findByVegetationCodeUnauthorizedTest() throws Exception {
    mockMvc
        .perform(
            get(API_PATH)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized())
        .andReturn();
  }
}
