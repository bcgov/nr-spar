package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.exception.NoGeneticClassException;
import ca.bc.gov.backendstartapi.service.GeneticClassService;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(GeneticClassEndpoint.class)
class GeneticClassEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private GeneticClassService geneticClassService;

  private static final String API_PATH = "/api/genetic-classes";

  private static final String API_PATH_W_CODE = "/api/genetic-classes/A";

  private static final String CONTENT_HEADER = "Content-Type";

  private static final String JSON = "application/json";

  @Test
  @DisplayName("getAllGeneticClassTest")
  @WithMockUser(roles = "user_read")
  void getAllGeneticClassTest() throws Exception {

    CodeDescriptionDto firstMethod = new CodeDescriptionDto("A", "Orchard Seed or Cuttings");
    CodeDescriptionDto secondMethod = new CodeDescriptionDto("B", "Natural Stand Seed or Cuttings");

    when(geneticClassService.getAllGeneticClass()).thenReturn(List.of(firstMethod, secondMethod));

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
  @DisplayName("getGeneticClassByCodeTest")
  @WithMockUser(roles = "user_read")
  void getGeneticClassByCodeTest() throws Exception {
    var testCode = "A";
    var testDescription = "Orchard Seed or Cuttings";

    CodeDescriptionDto testDto = new CodeDescriptionDto(testCode, testDescription);

    when(geneticClassService.getGeneticClassByCode(testCode)).thenReturn(testDto);

    mockMvc
        .perform(
            get(API_PATH_W_CODE)
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
  @DisplayName("getGeneticClassByCodeEmptyTest")
  @WithMockUser(roles = "user_read")
  void getGeneticClassByCodeEmptyTest() throws Exception {
    when(geneticClassService.getGeneticClassByCode("A")).thenThrow(new NoGeneticClassException());
    mockMvc
        .perform(
            get(API_PATH_W_CODE)
                .with(csrf().asHeader())
                .header(CONTENT_HEADER, JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andReturn();
  }
}
