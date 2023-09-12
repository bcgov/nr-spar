package ca.bc.gov.backendstartapi.endpoint;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthSummaryDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.exception.NoGeneticWorthException;
import ca.bc.gov.backendstartapi.service.GeneticWorthService;
import java.math.BigDecimal;
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
class GeneticWorthEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private GeneticWorthService geneticWorthService;

  private static final String API_PATH = "/api/genetic-worth";

  private static final String CONTENT_HEADER = "Content-Type";

  private static final String JSON = "application/json";

  private String stringifySuccess() {
    return """
      [
        {"parentTreeNumber": "129",
        "coneCount": 13,
        "pollenCount": 48.5,
        "gvo": 18,
        "wwd": -2.2},
        {"parentTreeNumber": "212",
        "coneCount": 8.5,
        "pollenCount": 49,
        "gvo": 20,
        "wwd": 1.7},
        {"parentTreeNumber": "300",
        "coneCount": 129.5,
        "pollenCount": 93,
        "gvo": 15,
        "wwd": -0.8},
        {"parentTreeNumber": "3141",
        "coneCount": 71.20833333,
        "pollenCount": 35,
        "gvo": 23,
        "wwd": -2.1},
        {"parentTreeNumber": "3144",
        "coneCount": 42.541666667,
        "pollenCount": 92.5,
        "gvo": 25,
        "wwd": -0.6},
        {"parentTreeNumber": "3169",
        "coneCount": 30.083333333,
        "pollenCount": 27,
        "gvo": 19,
        "wwd": -2.3},
        {"parentTreeNumber": "3210",
        "coneCount": 6,
        "pollenCount": 0,
        "gvo": 17,
        "wwd": 1.1},
        {"parentTreeNumber": "3245",
        "coneCount": 152,
        "pollenCount": 154.5,
        "gvo": 19,
        "wwd": -2.3}
      ]
        """;
  }

  private String stringifyBadRequest() {
    return """
      [
        {"parentTreeNumber": "",
        "coneCount": 13,
        "pollenCount": 48.5,
        "gvo": 18,
        "wwd": -2.2},
        {"parentTreeNumber": "",
        "coneCount": 8.5,
        "pollenCount": 49,
        "gvo": 20,
        "wwd": 1.7},
      ]
      """;
  }

  @Test
  @DisplayName("getAllGeneticWorthTest")
  @WithMockUser(roles = "user_read")
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
  @WithMockUser(roles = "user_read")
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
  @WithMockUser(roles = "user_read")
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

  @Test
  @DisplayName("calculateAll_NoData")
  @WithMockUser(roles = "user_write")
  void calculateAll_NoData() throws Exception {
    GeneticWorthSummaryDto summaryDto = new GeneticWorthSummaryDto(List.of());
    when(geneticWorthService.calculateGeneticWorth(any())).thenReturn(summaryDto);

    mockMvc
        .perform(
            post("/api/genetic-worth/calculate-all")
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON)
                .content(stringifySuccess()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.geneticTraits", hasSize(0)))
        .andReturn();
  }

  @Test
  @DisplayName("calculateAll_BadRequest")
  @WithMockUser(roles = "user_write")
  void calculateAll_BadRequest() throws Exception {
    mockMvc
        .perform(
            post("/api/genetic-worth/calculate-all")
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON)
                .content(stringifyBadRequest()))
        .andExpect(status().isBadRequest())
        .andReturn();
  }

  @Test
  @DisplayName("calculateAll_Success")
  @WithMockUser(roles = "user_write")
  void calculateAll_Success() throws Exception {
    GeneticWorthTraitsDto gvoTrait =
        new GeneticWorthTraitsDto("GVO", null, new BigDecimal("55"), new BigDecimal("67"));
    GeneticWorthTraitsDto wwdTrait =
        new GeneticWorthTraitsDto("WWD", null, new BigDecimal("56"), new BigDecimal("68"));
    GeneticWorthSummaryDto summaryDto = new GeneticWorthSummaryDto(List.of(gvoTrait, wwdTrait));
    when(geneticWorthService.calculateGeneticWorth(any())).thenReturn(summaryDto);

    mockMvc
        .perform(
            post("/api/genetic-worth/calculate-all")
                .with(csrf().asHeader())
                .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON)
                .content(stringifySuccess()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.geneticTraits[0].traitCode").value("GVO"))
        .andExpect(jsonPath("$.geneticTraits[0].calculatedValue").value("55"))
        .andExpect(jsonPath("$.geneticTraits[0].testedParentTreePerc").value("67"))
        .andExpect(jsonPath("$.geneticTraits[1].traitCode").value("WWD"))
        .andExpect(jsonPath("$.geneticTraits[1].calculatedValue").value("56"))
        .andExpect(jsonPath("$.geneticTraits[1].testedParentTreePerc").value("68"))
        .andReturn();
  }
}
