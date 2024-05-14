package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.exception.NoGeneticWorthException;
import ca.bc.gov.backendstartapi.service.GeneticWorthService;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(GeneticWorthEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class GeneticWorthEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private GeneticWorthService geneticWorthService;

  private static final String API_PATH = "/api/genetic-worth";

  private static final String CONTENT_HEADER = "Content-Type";

  private static final String JSON = "application/json";

  @Test
  @DisplayName("getAllGeneticWorthTest")
  void getAllGeneticWorthTest() throws Exception {

    CodeDescriptionDto firstMethod =
        new CodeDescriptionDto("AD", "Animal browse resistance (deer)");
    CodeDescriptionDto secondMethod =
        new CodeDescriptionDto(
            "DFS", "Disease resistance for Dothistroma needle blight (Dothistroma septosporum)");

    when(geneticWorthService.getAllGeneticWorth()).thenReturn(List.of(firstMethod, secondMethod));

    mockMvc
        .perform(
            get(API_PATH)
                .with(csrf().asHeader())
                .header(CONTENT_HEADER, JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType("application/json"))
        .andExpect(jsonPath("$[0].code").value(firstMethod.code()))
        .andExpect(jsonPath("$[0].description").value(firstMethod.description()))
        .andExpect(jsonPath("$[1].code").value(secondMethod.code()))
        .andExpect(jsonPath("$[1].description").value(secondMethod.description()))
        .andReturn();
  }

  @Test
  @DisplayName("getGeneticWorthByCodeTest")
  void getGeneticWorthByCodeTest() throws Exception {
    var testCode = "AD";
    var testDescription = "Animal browse resistance (deer)";
    var testApiPath = API_PATH + "/" + testCode;

    CodeDescriptionDto testDto = new CodeDescriptionDto(testCode, testDescription);

    when(geneticWorthService.getGeneticWorthByCode(testCode)).thenReturn(testDto);

    mockMvc
        .perform(
            get(testApiPath)
                .with(csrf().asHeader())
                .header(CONTENT_HEADER, JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType("application/json"))
        .andExpect(jsonPath("$.code").value(testCode))
        .andExpect(jsonPath("$.description").value(testDescription))
        .andReturn();
  }

  @Test
  @DisplayName("getGeneticWorthByCodeEmptyTest")
  void getGeneticWorthByCodeEmptyTest() throws Exception {
    var testCode = "WWE";
    when(geneticWorthService.getGeneticWorthByCode(testCode))
        .thenThrow(new NoGeneticWorthException());
    mockMvc
        .perform(
            get(API_PATH + "/" + testCode)
                .with(csrf().asHeader())
                .header(CONTENT_HEADER, JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andReturn();
  }
}
