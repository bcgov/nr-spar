package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.dto.OrchardSpuDto;
import ca.bc.gov.backendstartapi.exception.NoParentTreeDataException;
import ca.bc.gov.backendstartapi.exception.NoSpuForOrchardException;
import ca.bc.gov.backendstartapi.service.OrchardService;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(OrchardEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class OrchardEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private OrchardService orchardService;

  @Test
  @DisplayName("getParentTreeGeneticQualityDataSuccessTest")
  void getParentTreeGeneticQualityDataSuccessTest() throws Exception {
    String orchardId = "123";

    OrchardSpuDto parentTreeDto = new OrchardSpuDto(orchardId, "ACT", 1L, List.of());

    when(orchardService.findParentTreeGeneticQualityData(orchardId)).thenReturn(parentTreeDto);

    mockMvc
        .perform(
            get("/api/orchards/{orchardId}/parent-tree-genetic-quality", orchardId)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.orchardId").value(orchardId))
        .andExpect(jsonPath("$.vegetationCode").value("ACT"))
        .andExpect(jsonPath("$.seedPlanningUnitId").value("1"))
        .andReturn();
  }

  @Test
  @DisplayName("getParentTreeGeneticQualityDataNotFoundTest")
  void getParentTreeGeneticQualityDataNotFoundTest() throws Exception {
    String orchardId = "222";

    when(orchardService.findParentTreeGeneticQualityData(orchardId))
        .thenThrow(new NoParentTreeDataException());

    mockMvc
        .perform(
            get("/api/orchards/{orchardId}/parent-tree-genetic-quality", orchardId)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(status().reason("No Parent Tree data for the given Orchard!"))
        .andReturn();
  }

  @Test
  @DisplayName("getParentTreeGeneticQualityDataNoSpuTest")
  void getParentTreeGeneticQualityDataNoSpuTest() throws Exception {
    String orchardId = "222";

    when(orchardService.findParentTreeGeneticQualityData(orchardId))
        .thenThrow(new NoSpuForOrchardException());

    mockMvc
        .perform(
            get("/api/orchards/{orchardId}/parent-tree-genetic-quality", orchardId)
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(status().reason("No active SPU for the given Orchard ID!"))
        .andReturn();
  }
}
