package ca.bc.gov.oracleapi.endpoint;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.oracleapi.entity.TransferLimitEntity;
import ca.bc.gov.oracleapi.repository.TransferLimitRepository;
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
import org.springframework.test.web.servlet.ResultActions;

@WebMvcTest(TransferLimitEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class TransferLimitEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private TransferLimitRepository transferLimitRepository;

  private static final String API_PATH = "/api/transfer-limits";

  private ResultActions perform(String path) throws Exception {
    return mockMvc.perform(
        get(path)
            .with(csrf().asHeader())
            .header("Content-Type", "application/json")
            .accept(MediaType.APPLICATION_JSON));
  }

  private TransferLimitEntity limit() {
    TransferLimitEntity entity = new TransferLimitEntity();
    entity.setTransferLimitSkey(2L);
    entity.setVegetationCode("FDC");
    entity.setGeneticClassCode("B");
    entity.setSuperiorProvenance(false);
    entity.setCoastInteriorCode("C");
    entity.setSeedPlanZoneCode("M");
    entity.setSiteMinLatDeg(48);
    entity.setSiteMaxLatDeg(60);
    entity.setLimitNorthLatDeg(3);
    entity.setLimitSouthLatDeg(2);
    entity.setLimitUpElevation(350);
    entity.setLimitDownElevation(350);
    return entity;
  }

  @Test
  @DisplayName("search passes upper-cased criteria and returns the matching limits")
  void searchTest() throws Exception {
    when(transferLimitRepository.search("FDC", "B", false, "C", "M", 49, true))
        .thenReturn(List.of(limit()));

    perform(
            API_PATH
                + "?vegetationCode=fdc&geneticClassCode=b&superiorProvenance=false"
                + "&coastInteriorCode=c&seedPlanZoneCode=m&latitudeDeg=49&includeNullMatches=true")
        .andExpect(status().isOk())
        .andExpect(content().contentType("application/json"))
        .andExpect(jsonPath("$[0].transferLimitSkey").value(2))
        .andExpect(jsonPath("$[0].vegetationCode").value("FDC"))
        .andExpect(jsonPath("$[0].superiorProvenance").value(false))
        .andExpect(jsonPath("$[0].coastInteriorCode").value("C"))
        .andExpect(jsonPath("$[0].limitNorthLatDeg").value(3))
        .andExpect(jsonPath("$[0].limitUpElevation").value(350));
  }

  @Test
  @DisplayName("search with no criteria applies none and returns an empty list")
  void searchNoCriteriaTest() throws Exception {
    when(transferLimitRepository.search(any(), any(), any(), any(), any(), any(), anyBoolean()))
        .thenReturn(List.of());

    perform(API_PATH).andExpect(status().isOk()).andExpect(jsonPath("$").isEmpty());
    verify(transferLimitRepository)
        .search(isNull(), isNull(), isNull(), isNull(), isNull(), isNull(), eq(false));
  }

  @Test
  @DisplayName("search returns 400 for invalid criteria")
  void searchInvalidCriteriaTest() throws Exception {
    perform(API_PATH + "?geneticClassCode=X").andExpect(status().isBadRequest());
    perform(API_PATH + "?superiorProvenance=maybe").andExpect(status().isBadRequest());
    perform(API_PATH + "?coastInteriorCode=X").andExpect(status().isBadRequest());
    perform(API_PATH + "?latitudeDeg=91").andExpect(status().isBadRequest());
    verifyNoInteractions(transferLimitRepository);
  }

  @Test
  @DisplayName("search unauthorized")
  @WithAnonymousUser
  void searchUnauthorizedTest() throws Exception {
    perform(API_PATH).andExpect(status().isUnauthorized());
  }
}
